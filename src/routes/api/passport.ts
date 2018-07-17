import * as express from 'express';
import * as bodyParser from 'body-parser';
import { User } from '../../model/user';
import * as passport from 'passport';
import { MySession } from '../../types/middleware';

/**
 * SETTINGS
 */
const router = express.Router();
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

/**
 * Logs user out of session.
 */
router.all('/logout', function (req, res) {
  req.logout();
  return res.json({ 'success': true })
})

/**
 * Check if host is logged in as a user.
 * @returns `{success: boolean, user: { id:number, alias:string, email:string }}`
 */
router.post('/isloggedin/', jsonParser, async function (req: any, res) {
  if (req.isAuthenticated()) {
    // if (req.session == undefined ) return res.json({ 'success': false })
    let user = await User.get(req.session.passport.user)
      .then(u => { return u.toString() })
      .catch(error => { return res.json({ 'success': false }) });
    return res.json({ 'success': true, 'user': user })
  }
  return res.json({ 'success': false })
})

/**
 * A route that is redirected to if login fails at `POST /api/passport/login`. Only returns `false`.
 * @returns `{ success : boolean }`
 */
router.get('/login/failure', jsonParser, function (req, res) {
  res.json({ 'success': false })
})

/**
 * @returns `{success: boolean, user: { id:number, alias:string, email:string }}`
 */
router.get('/login/success', jsonParser, async function (req: any, res) {
  console.log(`/api/passport/login/success req.session=${JSON.stringify(req.session)}`)
  res.json({ 'success': true, 'user': await User.get(req.session!.passport.user) })
})

module.exports = router;
