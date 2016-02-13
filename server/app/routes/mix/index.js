'use strict';
var mongoose = require('mongoose');
var mime = require('mime');
var path = require('path');
var router = require('express').Router();
var _ = require('lodash');
var request = require('request');
var Mix = require("mongoose").model('Mix'); //need to make a mix db schema
module.exports = router;

router.route('/')
    .get(function (req, res, next) {
        console.log("hitting api mix");
        Mix.find({}).exec()
            .then(mixes => res.send(mixes))
            .then(null, next);
    })
    .post(function (req, res, next) {
        console.log('post request received')
        Mix.create(req.body)
            .then(mixes => res.status(201).send(mixes))
            .then(null, next)
    });

router.param('mixId', function (req, res, next, id) {
    mongoose.model('Mix')
        .findById(id).exec()
        .then(function(mix) {
            if (!mix) throw new Error('not found!');
            req.mix = mix;
            next();
        })
        .then(null, next);
});

router.route('/:mixId')
    .get(function (req, res, next) {
        Mix.findById(req.params.mixId).exec()
            .then(function(mix) {
                if (!mix) return res.status(404).end();
                res.send(mix);
            }).then(null, next)
    })
    .post(function (req, res, next) {
        Mix.create(req.body).exec()
            .then(mix => res.status(201).send(mix))
            .then(null, next);
    })
    .delete(function (req, res, next) {
        Mix.findByIdAndRemove(req.params.mixId).exec()
            .then(track => res.status(204).end())
            .then(null, next)
    });
