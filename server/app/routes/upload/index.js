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

const filesDir = path.join(process.cwd(), 'server/audio');
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
            filesNames = filesNames.filter(function(file){
                return file.indexOf('DS_Store') < 0
            })
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


router.post('/', uploading.array('audio[]', 40), function (req, res, next) {

connectToDb.bind({docsToSave: {}})
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
       //   console.log("song id", song.path.split('/').pop())
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
    // move the files to a directory on the server
    .then(function (songs) {
        console.log("move files");
        this.songs = songs;
        console.log("the songs", this.songs)
        //console.log("files", this.files)
        return Promise.map(this.songs, function (file) {
            return new Promise(function (resolve, reject) {
                console.log("path", file.path);
                let readStream = fs.createReadStream(file.path);
                let writeStream = fs.createWriteStream(path.join(filesDir, file._id.toString()));
                readStream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);
                readStream.pipe(writeStream)
            })
        })
    })
    .then(function (results) {
        console.log('complete!', results);
        res.send(results).status(200)
    })
    .catch(function (e) {
        console.error(e);
        console.error(e.stack);
    });

});


module.exports = router;
