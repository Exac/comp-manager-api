import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import { User } from '../../model/user';
import * as passport from 'passport';
const MySQLStore = require('express-mysql-session')(session)

/**
 * SETTINGS
 */
const router = express.Router();
const db = { host: "127.0.0.1", user: "root", password: "chollima", database: "users" };
const sessionStore = new MySQLStore(db);
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: false }); // & parsing form requests

/**
 * ROUTES FOR /api/passport/*
 */

/**
 * Check if supplied `HttpParams` `email`, and `password` match a user. 
 * Returns `{success: boolean, user?:User}` via redirects.
 * 
 * @param email HttpParams.email
 * @param password HttpParams.password
 */
router.post('/login/',
  (req, res) => passport.authenticate('local',
    {
      successRedirect: '/api/passport/login/success',
      failureRedirect: '/api/passport/login/failure'
    }
  )(req, res)
);

router.all('/logout', function (req, res) {
  req.logout();
  return res.json({ 'success': true })
})

router.post('/isloggedin/', jsonParser, async function (req, res) {
  if (req.isAuthenticated()) {
    let user: User;
    await User.get(req.session.passport.user)
      .then(u => user = u)
      .catch(error => { return res.json({ 'success': false }) });
    return res.json({ 'success': true, 'user': user })
  }
  return res.json({ 'success': false })
})

router.get('/login/failure', jsonParser, function (req, res) {
  res.json({ 'success': false })
})

router.get('/login/success', jsonParser, async function (req, res) {
  console.log(`/api/passport/login/success req.session=${JSON.stringify(req.session)}`)
  res.json({ 'success': true, 'user': await User.get(req.session.passport.user) })
})

router.get
module.exports = router;
