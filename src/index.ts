import 'dotenv/config'; // use .env file's variables if in production
import * as express from 'express';
import * as bodyParser from 'body-parser';
// import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as session from 'express-session';
// import * as co from 'co'
import * as passport from 'passport'
import * as pg from 'pg';
import { User } from './model/user';
import { IUser } from './model/Iuser';
import { v4 as uuid } from 'uuid';
import db from './model/db';
// import connectPgSimple = require('connect-pg-simple');
import Competition from './model/comp/Competition';
const connectPgSimple = require('connect-pg-simple');
const cookieParser = require('cookie-parser')
const co = require('co')

export const app: express.Application = express();

let LocalStrategy = require('passport-local').Strategy;
!(async function () {
  /**
   * PASSPORT
   */
  let localStrategy = new LocalStrategy(
    { usernameField: 'email', session: false, passReqToCallback: true },
    function (req: Request, username: string, password: string, done: any) {
      return co(function* () {
        // console.log(`LocalStrategy() -> reqCo=${req.isAuthenticated()}`)
        try {
          let result: any = yield Promise.resolve(User.authenticate(username, password));
          // console.log(`LocalStrategy() -> result=${JSON.stringify(result)}`)
          if (result.user) {
            // console.log(`LocalStrategy() -> user=${JSON.stringify(result.user)}`)
            // console.log(`LocalStrategy() -> reqU=${req.isAuthenticated()}`)
            return done(null, result.user)
          } else {
            // console.log(`LocalStrategy() -> couldn't match username and password to user`)
            // console.log(`LocalStrategy() -> reqE=${req.isAuthenticated()}`)
            return done(null, false)
          }
        } catch (error) {
          // console.log(`error in new LocalStrategy, error: ${JSON.stringify(error)}`)
          return done(false)
        }
      });
    });

  localStrategy = new LocalStrategy(
    { usernameField: 'email', session: false, passReqToCallback: true },
    function (req: Request, username: string, password: string, done: any) {
      return co(function* () {
        try {
          let result: any = yield Promise.resolve(User.authenticate(username, password));
          if (result.user) {
            return done(null, result.user)
          } else {
            return done(null, false)
          }
        } catch (error) {
          return done(false)
        }
      })
    });

  passport.serializeUser(function (user: IUser, done) {
    // console.log(`serializeUser(user=${JSON.stringify(user)})`)
    done(null, user.id);
  });

  passport.deserializeUser(function (id: number, done) {
    // console.log(`deserializeUser(id=${id})`)
    return co(function* () {
      try {
        let user = yield Promise.resolve(User.get(id));
        // console.log(`deserializeUser() -> user=${JSON.stringify(user)}`)
        if (!user) { return done(null, false) }
        done(null, user)
      } catch (error) {
        // console.log(`u=(error)${error}`)
        done(error)
      }
    })
  });

  passport.use(localStrategy);

  /**
   * CONFIG
   */

  let isProduction = process.env.NODE_ENV === 'production';
  let isTest = process.env.NODE_ENV === 'testing';

  // If we're testing one the same machine that we're developing on,
  // we need to run both processes on different ports
  const PORT: number = isProduction ? parseInt(process.env.PORT || "8081") : isTest ? 8082 : 8081
  const IP: string = isProduction ? process.env.IP || '0.0.0.0' : '0.0.0.0';

  // PostgreSQL
  const pgSession = connectPgSimple(session);
  const pgConfig: pg.ClientConfig = process.env.NODE_ENV !== 'production'
    ? {
      host: 'localhost',
      port: 5432,
      database: 'chollima',
      user: 'chollima',
      password: 'chollima'
    }
    : {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    }
  const pgClient = new pg.Client(pgConfig)
  const pgSessionStore: session.Store = new pgSession()

  // Init body parsing middleware
  const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
  const urlEncodedParser = bodyParser.urlencoded({ extended: true }); // and parsing normal form requests

  // Cross-domain access
  // TODO: only allow during development
  let originsWhitelist = [
    'http://192.168.1.6:4200',
    'http://localhost:4200',
    'http://0.0.0.0:4200',
    'http://127.0.0.1:4200'
  ];
  let corsOptions = {
    origin: function (origin: any, callback: any) {
      let isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
      callback(null, isWhitelisted);
    },
    credentials: true
  }

  /**
   * MIDDLE-WARE
   */
  app.use(cors(corsOptions));
  app.use(urlEncodedParser)

  // init logger
  app.use(morgan(function (tokens, req, res) {
    morgan.token('request', function getRequest(req) {
      if (req.body && req.body.password) req.body.password = '**********'; // Don't log people's passwords
      return JSON.stringify(req.body);
    })
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['request'](req, res), '-'
    ].join(' ')
  }));
  // Promise rejection logger
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });

  // Session config
  // TODO: session secret should be an array of two secrets, and they should be taken from
  // Environmental variables and rotated around every few days in production
  app.use(session({
    genid: function (req) {
      return uuid();
    },
    secret: process.env.NODE_ENV === 'production' // secret used to generate hash
      ? process.env.SESSION_SECRET || 'bbzgbxjktgfeacwmsycpquyxovfukhsg'
      : 'bbzgbxjktgfeacwmsycpquyxovfukhsg',
    store: pgSessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1 * 13 * 60 * 60 * 1000 } // 13 hours
  }))

  app.use(cookieParser()); // passport won't work without this ?
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static('dist'));

  /**
   * ROUTES
   */
  app.use(require('./routes'));

  /**
   * START SERVER
   */
  const server = app.listen(PORT, IP, function () {
    console.log(`Listening @ http://${IP}:${PORT}/`);
  });

})();

export default app
