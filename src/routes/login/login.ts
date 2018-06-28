import * as express from 'express';
const router = express.Router();

router.get('/recovery/', function (req, res) {
    const params = '?' + req.url.split('?').pop();

    if (process.env.NODE_ENV === 'production') { // On a production server, the API and frontend should both be running on port 443.
        res.writeHead(302, {
            Location: `${req.protocol}://${req.get("host")}/login/recovery/${params}`
        })
    } else { 
        res.writeHead(302, { // but in dev, we redirect it to the frontend's port so the frontend can be live-reloaded by it's own process.
            Location: `${req.protocol}://localhost:4200/login/recovery/${params}`
        });
    }
    res.end();
});


module.exports = router;