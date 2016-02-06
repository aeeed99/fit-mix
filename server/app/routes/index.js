'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/members', require('./members'));
router.use('/tracks', require('./tracks'));
router.use('/sfx', require('./sfx'));
router.use('/upload', require('./upload'));
// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
