import * as express from 'express'; // CRUD => .post, .get, .put, .delete
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import { User } from './model/user';
import * as session from 'express-session';
import * as co from 'co'
import { v4 as uuid } from 'uuid';
import * as passport from 'passport'
let LocalStrategy = require('passport-local').Strategy;

/**
 * PASSPORT
 */
const localStrategy = new LocalStrategy({ usernameField: 'email', session: false, passReqToCallback: true }, function (req, username, password, done) {

  console.log(`LocalStrategy(req, username=${username}, password=${password}, done() )`)
  return co(function* () {
      console.log(`LocalStrategy() -> reqCo=${req.isAuthenticated()}`)
      try {
          let result: any = yield Promise.resolve(User.authenticate(username, password));
          console.log(`LocalStrategy() -> result=${JSON.stringify(result)}`)
          if (result.user) {
              console.log(`LocalStrategy() -> user=${JSON.stringify(result.user)}`)
              console.log(`LocalStrategy() -> reqU=${req.isAuthenticated()}`)
              return done(null, result.user)
          } else {
              console.log(`LocalStrategy() -> couldn't match username and password to user`)
              console.log(`LocalStrategy() -> reqE=${req.isAuthenticated()}`)
              return done(null, false)
          }
      } catch (error) {
          console.log(`error in new LocalStrategy, error: ${JSON.stringify(error)}`)
          return done(false)
      }
  });
});


passport.serializeUser(function (user: IUser, done) {
  console.log(`serializeUser(user=${JSON.stringify(user)})`)
  done(null, user.id);
});

passport.deserializeUser(function (id: number, done) {
  console.log(`deserializeUser(id=${id})`)
  return co(function* () {
      try {
          let user = yield Promise.resolve(User.get(id));
          console.log(`deserializeUser() -> user=${JSON.stringify(user)}`)
          if (!user) { return done(null, false) }
          done(null, user)
      } catch (error) {
          console.log(`u=(error)${error}`)
          done(error)
      }
  })
});

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect("/not-logged-in");
}

passport.use(localStrategy);

/**
 * CONFIG
 */

let isProduction = process.env.NODE_ENV === 'production';

const PORT: number = 8081; // https://stackoverflow.com/questions/44344793/how-to-run-node-express-server-and-angular-on-the-same-port
const IP: string = '0.0.0.0';
const app = express();

// MySQL
const MySQLStore = require('express-mysql-session')(session)
const db = { host: "127.0.0.1", user: "root", password: "", database: "users" };
const sessionStore = new MySQLStore(db);

// Init body parsing middleware
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: true }); // and parsing normal form requests

// Cross-domain access
// TODO: only allow during development
let originsWhitelist = ['http://192.168.1.6:4200', 'http://localhost:4200', 'http://0.0.0.0:4200', 'http://127.0.0.1:4200'];
let corsOptions = {
  origin: function (origin, callback) {
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
  secret: 'bbzgbxjktgfeacwmsycpquyxovfukhsg', // secret used to generate hash
  store: sessionStore,
  resave: false,
  saveUninitialized: true
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
