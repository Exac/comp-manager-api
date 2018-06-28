var router = require('express').Router();

router.use('/api', require('./api/index'));
router.use('/login', require('./login/index'));


module.exports = router;