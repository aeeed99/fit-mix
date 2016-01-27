'use strict';
var mongoose = require('mongoose')
var mime = require('mime')
var path = require('path')
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

router.param('songId', function(req, res, next, id) {
  mongoose.model('Track')
    .findById(id)
    .then(function(song) {
      if(!song) throw new Error('not found!')
      req.song = song
      next()
    })
    .then(null, next)
})

router.get('/:songId.audio', function(req, res, next) {
    console.log("req", req.params)
  if(!req.song.extension) return next(new Error('No audio for song'))
  res.set('Content-Type', mime.lookup(req.song.extension))
  res.sendFile(path.join(process.cwd(), 'server/audio', req.params.songId))
})
