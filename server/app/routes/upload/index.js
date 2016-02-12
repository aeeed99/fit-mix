var express = require('express');
var router = express.Router();
var path = require('path');
//var post = require('./models');
var formidable = require('formidable'); //formidable is a node.js module for parsing form data, especially file uploads.
var util = require('util');
var fs = require('fs-extra');
var multer = require('multer');
var uploading = multer({
  dest: __dirname + '../../../../uploads/',
})

const mongoose = require('mongoose');
//const connectToDb = require('../server/db');
const Track = require('mongoose').model('Track');
const chalk = require('chalk');
const Promise = require('bluebird');
const helper = require('../../../../bin/helper');
const metadata = require('../../../../bin/metaDataWrapper');
Promise.promisifyAll(fs);
const connectToDb = require('../../../db');
const dir = path.join(__dirname, '../../../uploads/');

const extractMetaData = function (path) {
    return helper.dirWalk(path)
        .then(function (filesNames) {
            console.log("filesNames", filesNames);
            return filesNames
        })
        .map(function (name) {
            console.log("name", name)
            return metadata(name)
        })
};

const clearDb = function () {
  console.log("HERE")
    return Promise.map(['Track', 'User'], function (modelName) {
        console.log("model", modelName);
        return mongoose.model(modelName).remove()
    })
};


router.post('/', uploading.array('track', 2), function (req, res, next) {
console.log("tracks", req.files)
connectToDb.bind({docsToSave: {}})
    .then(function () {
        //clear database
        console.log("clearing")
        return clearDb()
    })
    .then(function () {
        // get song metadata
        console.log("metadata")
        return extractMetaData(dir)
    })
    // add DB records for each song
    .then(function (songs) {
        var promises = [];
        songs.forEach(function (song) {
          console.log("song", song)
            var newSong = new Track({
                name: song.name,
                artist: song.artist,
                genre: song.genre,
                extension: song.path.split('.').pop(),
                path: song.path,
                bpm: song.bpm ? song.bpm : null,
                key: song.key ? song.key : null,
                comment: song.comment ? song.comment : null,
                cover: song.picture ? song.picture.data : null,
                duration: song.duration ? song.duration : null,
            });
            promises.push(Track.create(newSong))
        });
        return Promise.all(promises)
    })
    .then(function (results) {
        console.log('complete!', results);
        //process.exit(0)
        res.send(results).status(200)
    })
    .catch(function (e) {
        console.error(e);
        console.error(e.stack);
      //  process.exit()
    });

});


module.exports = router;
