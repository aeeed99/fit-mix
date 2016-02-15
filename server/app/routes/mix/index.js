'use strict';
var mongoose = require('mongoose');
var mime = require('mime');
var path = require('path');
var router = require('express').Router();
var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var jsonfile = require('jsonfile')
var exec = require('child_process').exec;
module.exports = router;

router.route('/download')
    .post(function (req, res, next) {
        var mix = req.body;
        console.log("new mix", mix)
        jsonfile.writeFile('mix.json', mix, {spaces: 2}, function(err){

            exec(`python stitch.py '${JSON.stringify(mix)}'`, function (err, stdout) {
                if (err) return console.error(err);
                console.log(stdout);

                var filePath = path.join(__dirname, '../../../../myMIX.mp3');
                res.send('myMIX.mp3').status(201)
            })

        });

    });

router.route('/download/:mix')
    .get(function (req, res, next) {
        console.log("mix?", req.params.mix)
        var file = __dirname + '../../../../../' + req.params.mix;
        res.download(file);
    });


router.route('/')
    .get(function (req, res, next) {
        Mix.find({}).exec()
            .then(mixes => send(mixes))
            .then(null, next);
    })
    .post(function (req, res, next) {
        Mix.create(req.body).exec()
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


