'use strict';

const router = require('express').Router();
const _ = require('lodash');
const request = require('request');
const Track = require('mongoose').model('Track');
const mongoose = require('mongoose');
const mime = require('mime');
const path = require('path');

module.exports = router;

router.route('/')
    .get(function (req, res, next) {
        Track.find({}).exec()
            .then(tracks => res.send(tracks)) //??: don't need res.status(200); NP: but still need `res.send(tracks)`
            .then(null, next);
    });

router.param('songId', function (req, res, next, id) {
    mongoose.model('Track')
        .findById(id).exec()
        .then(function(song) {
            if (!song) throw new Error('not found!');
            req.song = song;
            next();
        })
        .then(null, next);
});

router.route('/:songId.audio')
    .get(function (req, res, next) {
        console.log(req.song);
        console.log("req: ", req.params);
        if (!req.song.extension) return next(new Error('No audio for song'));
        res.set('Content-Type', mime.lookup(req.song.extension));
        res.sendFile(path.join(process.cwd(), 'server/audio', req.params.songId));
    })
    .post(function (req, res, next) {
        Track.create(req.body).exec() //will need to replace req.body dependent on uploading
            .then(track => res.status(201).send(track))
            .then(null, next);
    })
    .delete(function (req, res, next) {
        Track.findByIdAndRemove(req.params.songId.audio).exec()
            .then(track => res.status(204).end())
            .then(null, next)
    });
