var router = require('express').Router();

router.use('/user/', require('./user'));
router.use('/passport/', require('./passport'));

module.exports = router;