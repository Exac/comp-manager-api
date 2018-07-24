import * as express from 'express'
import * as bodyParser from 'body-parser'

const router = express.Router();
const jsonParser = bodyParser.json(); // for parsing POST/PUT/DELETE json requests
const urlEncodedParser = bodyParser.urlencoded({ extended: false }); // & parsing form requests

/**
 * ROUTES FOR /api/competition/*
 */

/**
 * Create a competition
 * @param req.body.competition
 * @returns `201` created or `400` if unable to create competition
 */
router.post('/', jsonParser, function (req: any, res) {
    //check if user is authenticated
    console.log('auth check', req.isAuthenticated())
    if (!req.isAuthenticated()) { return res.send('false') }
    console.log('POST /api/competition/', req.body)
    let competition = req.body.competition
    if (typeof competition === 'undefined') { return res.send('false') }

    

    return true
})

/**
 * Read a competition
 * @param req.body.competition_id The competition's id
 * @returns `Competition`
 */
router.get('/', jsonParser, async function (req: any, res) {
    return res.send('TODO')
})

/**
 * Change the name of a competition
 * @param req.body.competition_id The competition to change
 * @param req.body.name The updated competition name
 * @return boolean
 */
router.put('/name/', jsonParser, async function (req, res) {

})

/**
 * Change the join token of a competition
 * @param req.body.competition_id The competition to change
 * @param req.body.joinToken The updated join token
 * @return boolean
 */
router.put('/jointoken/', jsonParser, async function (req, res) {

})

/**
 * Change the join token of a competition
 * @param req.body.competition_id The competition to change
 * @param req.body.startDate The updated start date
 * @return boolean
 */
router.put('/startdate/', jsonParser, async function (req, res) {

})

/**
 * Change the join token of a competition
 * @param req.body.competition_id The competition to change
 * @param req.body.endDate The updated end date
 * @return boolean
 */
router.put('/endDate/', jsonParser, async function (req, res) {

})

/**
 * Change the join token of a competition
 * @param req.body.competition_id The competition to change
 * @param req.body.location The new location
 * @return boolean
 */
router.put('/location/', jsonParser, async function (req, res) {

})

module.exports = router;
