'use strict';

const router = require('express').Router();
const _ = require('lodash');
const request = require('request');
const Sfx = require('mongoose').model('Sfx');
const mongoose = require('mongoose');
const mime = require('mime');
const path = require('path');

module.exports = router;

router.route('/')
    .get(function (req, res, next) {
        Sfx.find({}).exec()
            .then(sfxes => res.send(sfxes)) //??: don't need res.status(200); NP: but still need `res.send(tracks)`
            .then(null, next);
    });

router.param('sfxId', function (req, res, next, id) {
    mongoose.model('Sfx')
        .findById(id).exec()
        .then(function(sfx) {
            if (!sfx) throw new Error('not found!');
            req.sfx = sfx;
            next();
        })
        .then(null, next);
});

router.route('/:sfxId.audio')
    .get(function (req, res, next) {
        console.log(req.sfx);
        console.log("req: ", req.params);
        if (!req.sfx.extension) return next(new Error('No audio for song'));
        res.set('Content-Type', mime.lookup(req.sfx.extension));
        res.sendFile(path.join(process.cwd(), 'server/sfx', req.params.sfxId));
    })
    .post(function (req, res, next) {
        Sfx.create(req.body).exec() //will need to replace req.body dependent on uploading
            .then(sfx => res.status(201).send(sfx))
            .then(null, next);
    })
    .delete(function (req, res, next) {
        Sfx.findByIdAndRemove(req.params.sfxId.audio).exec()
            .then(sfx => res.status(204).end())
            .then(null, next)
    });
