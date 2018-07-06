import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as Entities from 'html-entities';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User } from '../../model/user';
import { Connection } from 'mysql2/promise';

/**
 * SETTINGS
 */
const router = express.Router();
const db = { host: "127.0.0.1", user: "root", password: "chollima", database: "users" };
// const sessionStore = new MySQLStore(db);
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: false }); // and parsing normal form requests
let encoder = new Entities.AllHtmlEntities();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chollima.server@gmail.com',
        pass: encoder.decode('&#100;&#99;&#50;&#52;&#50;&#50;&#57;&#48;&#55;&#54;&#49;&#56;&#102;&#100;&#99;&#98;&#57;&#57;&#97;&#49;&#53;&#50;&#55;&#49;&#98;&#50;&#102;&#53;&#55;&#97;&#49;&#57;')
    }
});
// get a mysql connection from User
let connection: Connection;
(async function () {
    try {
        if (typeof User.connection === 'undefined') {
            // console.log('api/user')
            User.connection = <Connection>{};
            await User.dbConnect()
                .then(res => { connection = User.connection })
        }
    } catch (e) {
        console.log('/router/api/user async anonymous error:', e)
    }
})()

/**
 * ROUTES FOR /api/user/*
 */
router.post('/', jsonParser, async function (req, res) {
    // remove HTML chars from alias
    req.body.alias = new Entities.AllHtmlEntities().encode(req.body.alias);
    // create user
    await User.set(req.body.alias, req.body.email, req.body.password)
        .catch(err => {
            return (res.headersSent) ? null : res.json({ 'success': false, 'message': err })
        });
    return (res.headersSent) ? null : res.json({ 'success': true, 'message': req.body.email })
})

router.get('/alias/:userid', async function (req, res) {
    let alias = await User.getAlias(req.params.userid)
        .catch((err) => {
            return (res.headersSent) ? null : res.json({ 'alias': 'error' });
        })
    return (res.headersSent) ? null : res.json({ 'alias': alias })
});

router.get('/email/:userid', async function (req, res) {
    let email: string;
    await User.getEmail(req.params.userid)
        .then(result => { email = result })
        .catch((err) => {
            return (res.headersSent) ? null : res.json({ 'email': err });
        })
    return (res.headersSent) ? null : res.json({ 'alias': email })
});

router.get('/email/:email/exists', async function (req, res) {
    await User.existsEmail(req.params.email)
        .then(result => { return res.send(true) })
        .catch(error => { return res.send(false) })
    return res.send(false)
});

router.get('/alias/:alias/exists', async function (req, res) {
    await User.existsAlias(req.params.alias)
        .then(result => { return res.send(true) })
        .catch(error => { return res.send(false) })
    return res.send(false)
});

router.put('/password/', jsonParser, async function (req, res, next) {
    // update the user password
    let user: User = new User();
    user.id = req.body.id;
    if (typeof req.body.recovery !== 'undefined') {
        // user is submitting recovery code alongside password
        let valid = await user.isValidRecovery(req.body.id, req.body.recovery)
            .catch(err => {
                return (res.headersSent) ? null : res.json({ 'success': false })
            })
    }
    // user is updating password
    await user.setPassword(req.body.password)
        .catch(error => {
            console.error(error)
            return (res.headersSent) ? null : res.json({ 'success': false })
        })
    return (res.headersSent) ? null : res.json({ 'success': true })
});

router.get('/logout', async function (req, res) {
    // user wants to log out
    req.logout();
    return res.json({ 'success': true });
})

router.post('/login/', jsonParser, async function (req, res) {
    // user wants to login
    let valid = await User.isValidLogin(req.body.email, req.body.password)
        .then(res => {
            return res;
        })
        .catch(err => {
            return (res.headersSent) ? null : res.json({ 'success': false })
        })

    console.log('see if valid now:', valid)
    if (valid) {
        //set up session
        let id = await User.getId(req.body.email)
            .then(res => { return res })
            .catch(err => { return (res.headersSent) ? null : res.json({ 'success': false }) })
        let alias = await User.getAlias(parseInt(id.toString()))
            .catch(err => { return (res.headersSent) ? null : res.json({ 'success': false }) })
        if (!req.session.data) req.session.data = {};
        if (!req.session.data.user) req.session.data.user = {};
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

router.post('/forgot/', jsonParser, async function (req, res, next) {
    // to send an account recovery email...
    // validate request
    let user: User = new User();
    let email: string = req.body.email;
    if (email === 'undefined') {
        return (res.headersSent)
            ? null
            : res.json({ success: false, message: `Error: Missing email account.` })
    }
    let id: number;
    let recovery: string = crypto.randomBytes(Math.ceil(128 / 2)).toString('hex').slice(0, 128);
    await User.getId(email)
        .then((result: number) => { id = result; user.id = result })
        .catch(err => { return { 'success': false, 'message': err } })
    await user.setRecovery(recovery)
        .then((result: boolean) => { })
        .catch(err => { return { 'success': false, 'message': err } })
    const message = {
        from: transporter.options["auth"].user,
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

});

module.exports = router;
