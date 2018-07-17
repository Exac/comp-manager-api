import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as Entities from 'html-entities';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import SMTPTransport = require('nodemailer/lib/smtp-transport')
import { User } from '../../model/user';
import { ensureLoggedIn } from '../../model/passport';


/**
 * SETTINGS
 */
const router = express.Router();
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: false }); // and parsing normal form requests
let encoder = new Entities.AllHtmlEntities();
const user: string = process.env.NODE_ENV === 'production' ? process.env.NM_TRANS_EMAIL! : 'chollima.server@gmail.com';
const pass: string = process.env.NODE_ENV === 'production' ? process.env.NM_TRANS_PASS! : encoder.decode('&#100;&#99;&#50;&#52;&#50;&#50;&#57;&#48;&#55;&#54;&#49;&#56;&#102;&#100;&#99;&#98;&#57;&#57;&#97;&#49;&#53;&#50;&#55;&#49;&#98;&#50;&#102;&#53;&#55;&#97;&#49;&#57;');

const transporter: nodemailer.Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        'user': user,
        'pass': pass
    }
})

/**
 * ROUTES FOR /api/user/*
 */
/**
 * Create a new user
 * @param req.body.alias user alias
 * @param req.body.email user email
 * @param req.body.password user password
 * @returns `{ success: boolean, message: string }`, `message` = `email` or error message
 */
router.post('/', jsonParser, async function (req, res) {
    // remove HTML chars from alias
    req.body.alias = new Entities.AllHtmlEntities().encode(req.body.alias); // TODO: ensure the resulting alias isn't already in the db
    // create user
    await User.set(req.body.alias, req.body.email, req.body.password)
        .catch(err => {
            return (res.headersSent) ? null : res.json({ 'success': false, 'message': err })
        });
    return (res.headersSent) ? null : res.json({ 'success': true, 'message': req.body.email })
})

/**
 * Get user's alias with id...
 */
router.get('/alias/:userid', async function (req, res) {
    let alias = await User.getAlias(req.params.userid)
        .catch((err) => {
            return (res.headersSent) ? null : res.json({ 'alias': 'error' });
        })
    return (res.headersSent) ? null : res.json({ 'alias': alias })
});

/**
 * Get user's email with id...
 * @returns `{ email:boolean }`
 */
router.get('/email/:userid', async function (req, res) {
    let email = await User.getEmail(req.params.userid)
        .then(result => { return result })
        .catch((err) => {
            return (res.headersSent) ? null : res.json({ 'email': err });
        })
    return (res.headersSent) ? null : res.json({ 'email': email })
});

/**
 * Does any user have this email?
 * @returns boolean
 */
router.get('/email/:email/exists', async function (req, res) {
    await User.existsEmail(req.params.email)
        .then(result => { return res.send(result) })
        .catch(error => { return res.send(false) })
});

/**
 * Does any user have this alias?
 * @returns boolean
 */
router.get('/alias/:alias/exists', async function (req, res) {
    await User.existsAlias(req.params.alias)
        .then(result => { return res.send(result) })
        .catch(error => { return res.send(false) })
});

/**
 * Change a user's password
 * @param req.body.id user's id
 * @param req.body.recoveryOrOldPassword user's un-hashed recovery code or password
 * @param req.body.password user wants this as their new password
 * @returns `{ success: boolean }`
 */
router.put('/password/', jsonParser, async function (req, res, next) {
    // update the user password
    let user: User = new User();
    user.id = req.body.id;
    if (typeof req.body.recoveryOrOldPassword === 'undefined') {
        return (res.headersSent) ? null : res.json({ 'success': false })
    }
    // see if user is submitting recovery
    let validRecovery = await user.isValidRecovery(req.body.recoveryOrOldPassword, req.body.id)
        .then(res => { return res })
        .catch(err => { return false; })// recoveryOrOldPassword is potentially 
    // a password, so see if user is submitting a new password.
    // First, see if we can get an email for the supposed user:
    let email: string = await User.getEmail(req.body.id)
        .then(res => { return res })
        .catch(err => { return err })
    // next, see if we can login to an account with that email and the original password
    let validPassword = await User.isValidLogin(email, req.body.recoveryOrOldPassword)
        .then(res => { return res })
        .catch(err => { return false })
    if (!validRecovery && !validPassword) {
        // the supplied data didn't work
        return (res.headersSent) ? null : res.json({ 'success': false })
    }
    // update user's password
    await user.setPassword(req.body.password)
        .catch(error => {
            console.error(error)
            return (res.headersSent) ? null : res.json({ 'success': false })
        })
    return (res.headersSent) ? null : res.json({ 'success': true })
});

/**
 * Log out user
 * @returns `{ success: boolean }`
 */
router.get('/logout', async function (req, res) {
    // user wants to log out
    req.logout();
    return res.json({ 'success': true });
})

/**
 * Log in user
 * @param req.body.email User's email attempt
 * @param req.body.password User's password attempt
 * @returns `{ success: boolean }`
 */
router.post('/login/', jsonParser, async function (req: any, res) {
    // TODO: Limit login attempts if user is brute-forcing
    // user wants to login
    let valid = await User.isValidLogin(req.body.email, req.body.password)
        .then(res => {
            return res;
        })
        .catch(err => {
            return (res.headersSent) ? null : res.json({ 'success': false })
        })
    if (valid) {
        //set up session
        let id = await User.getId(req.body.email)
            .then(res => { return res })
            .catch(err => { return (res.headersSent) ? null : res.json({ 'success': false }) })
        if(typeof id !== 'number') return (res.headersSent) ? null : res.json({ 'success': false })
            let alias = await User.getAlias(id)
            .catch(err => { return (res.headersSent) ? null : res.json({ 'success': false }) })
        if (!req.session.data) req.session.data = {};
        if (!req.session.data.user) req!.session!.data.user = {};
        req.session.data.user = {
            'id': await User.getId(req.body.email),
            'alias': alias,
            'email': req.body.email
        };
        return (res.headersSent) ? null : res.json({ 'success': valid });
    } else {
        return (res.headersSent) ? null : res.json({ 'success': valid });
    }
});

/**
 * Send account-recovery email to user
 * @param req.body.email
 * @returns `{ success:boolean, message:string }`
 */
router.post('/forgot/', jsonParser, async function (req: express.Request, res) {
    // to send an account recovery email...
    // validate request
    let user: User = new User();
    let email: string = req.body.email;
    if (typeof email === 'undefined') {
        return (res.headersSent)
            ? null
            : res.json({ success: false, message: `Error: Missing email account.` })
    }
    let id: number = 0;
    let recovery: string = crypto.randomBytes(Math.ceil(128 / 2)).toString('hex').slice(0, 128);
    await User.getId(email)
        .then((result: number) => { id = result; user.id = result })
        .catch(err => { return { 'success': false, 'message': err } })
    await user.setRecovery(recovery)
        .then((result: boolean) => { })
        .catch(err => { return { 'success': false, 'message': err } })
    const message: {} = {
        from: user,
        to: req.body.email,
        subject: `Chollima password reset requested.`,
        text: `Hello, this is an automated message from Chollima.\n`
            + `We recieved a request to reset your account's password just now.`
            + `Please ignore this message if you don't know what Chollima is, or if you do not `
            + `have an account with us.`
            + `\nTo reset your password, please follow the following link:`
            + `\n\n${req.protocol}://${req.get("host")}/login/recovery/?id=${id}`
            + `&recovery=${recovery}`
            + `\n\nThe recovery link is valid for 4 hours.`,
        html: `<p>Hello, this is an automated message from Chollima.</p>\n`
            + `<p>We recieved a request to reset your account's password just now.</p>\n`
            + `<p>Please ignore this message if you don't know what Chollima is, or if you do not `
            + `have an account with us.</p>\n`
            + `<p>To reset your password, please follow the following link:</p>\n`
            + `<br><p>< href="${req.protocol}://${req.get("host")}/login/recovery/?id=${id}`
            + `&recovery=${recovery}">${req.protocol}://${req.get("host")}/login/recovery/?id=${id}`
            + `&recovery=${recovery}</a></p>\n`
            + `<br><p>The recovery link is valid for 4 hours.</p>\n`
    };
    await User.forgot(req.body.email, message, transporter)
        .then((reply: { 'success': boolean, 'message': string }) => {
            return (!res.headersSent) ? res.json(reply) : null;
        })
        .catch(err => {
            return (!res.headersSent) ? res.json(err) : null;
        })
    return
});

module.exports = router;
