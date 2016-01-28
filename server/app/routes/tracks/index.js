'use strict';
const router = require('express').Router();
const _ = require('lodash');
const request = require('request');
const Track = require('mongoose').model('Track');

module.exports = router;

router.get('/', function (req, res, next) {
    Track.find({})
    .then(tracks => res.status(200).send(tracks))
    .then(null, next);
});
