var router = require('express').Router();

// temporary redirect. When a password recovery email is sent from Node,
// it creates a link using Node's port, so now we recieve that password
// and send it back to the front-end.
router.use('/login/', require('./login'));

module.exports = router;
