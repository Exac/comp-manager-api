import * as express from 'express';
const router = express.Router();

/**
 * When we send a recovery email, the code sent to 
 * the user's inbox has a link that leads back to 
 * the server's backend URI scheme, instead of a
 * modular frontend that could change. During 
 * development, it is easier to develop the 
 * front-end on a separate port, and proxy. This
 * route sends a user to the front-end after they
 * open their recovery link.
 */
router.get('/recovery/', function (req, res) {
    const params = '?' + req.url.split('?').pop();
    const okCode: number = 302;
    // On a production server, the API and frontend should both be running on port 443.
    if (process.env.NODE_ENV === 'production') {
        res.writeHead(okCode, {
            Location: `${req.protocol}://${req.get("host")}/login/recovery/${params}`
        })
    } else { 
        // But in dev, we redirect it to the frontend's port so the frontend can be 
        // live-reloaded by it's own process.
        res.writeHead(okCode, { 
            Location: `${req.protocol}://localhost:4200/login/recovery/${params}`
        });
    }
    res.end();
});

module.exports = router;