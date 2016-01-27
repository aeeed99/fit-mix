'use strict';
var router = require('express').Router();
var _ = require('lodash');
var request = require('request');
var Track = require('mongoose').model('Track');

module.exports = router;

router.get('/', function (req, res, next) {
    Track.find({})
    .then(tracks => res.status(200).send(tracks))
    .then(null, next);
});
