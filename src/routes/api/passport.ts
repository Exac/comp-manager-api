import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as Entities from 'html-entities';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as session from 'express-session';
import { v4 as uuid } from 'uuid';
import { User } from '../../model/user';
import * as mysql2 from 'mysql2/promise';
import * as co from 'co'
import { Connection } from 'mysql2/promise';

const MySQLStore = require('express-mysql-session')(session)
import * as passport from 'passport';

/**
 * SETTINGS
 */
const router = express.Router();
const db = { host: "127.0.0.1", user: "root", password: "", database: "users" };
const sessionStore = new MySQLStore(db);
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: false }); // and parsing normal form requests


/**
 * ROUTES FOR /api/passport/*
 */



router.get('/', jsonParser, async function (req, res) {
    console.log('TODO: Delete this route')
    res.json({'GET':'/'})
});

router.post('/login/',
  (req, res) => passport.authenticate('local',
    { successRedirect: '/api/passport/success', failureRedirect: '/api/passport/failure' }
)(req, res));

router.get('/login/', function (req, res) {
  console.log('TODO: Delete this route; no passport here fam')
  res.send({'GET':'login'})
})

router.get('/failure', jsonParser, function (req, res) {
  res.json({'success': false})
})

router.get('/success', jsonParser, async function (req, res) {
  console.log(`/api/passport/success req.session=${JSON.stringify(req.session)}`)
  res.json({'success': true, 'user':await User.get(req.session.passport.user)})
})





module.exports = router;
