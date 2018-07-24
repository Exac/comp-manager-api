var router = require('express').Router();


router.use('/passport/', require('./passport'));
router.use('/user/', require('./user'));
router.use('/competition/', require('./competition'));

module.exports = router;
