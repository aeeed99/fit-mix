const dir = process.argv[2];
const fs = require('fs-extra');
const Promise = require('bluebird');
const pathLib = require('path');
const helper = require('./helper');
const _ = require('lodash');
const metadata = require('./metaDataWrapper');
Promise.promisifyAll(fs);
const mongoose = require('mongoose');
const connectToDb = require('../server/db');
const Track = mongoose.model('Track');

const filesDir = pathLib.join(process.cwd(), 'server/audio');
const extractMetaData = function (path) {
    return helper.dirWalk(path)
        .then(function (filesNames) {
            console.log("filesNames", filesNames);
            return filesNames.filter(helper.isMp3)
        })
        .map(function (name) {
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

    // empty the audio folder (or create it if it does not yet exists)
    .then(function (songs) {
        console.log("returned songs", songs);
        this.files = songs;
        return fs.emptyDirAsync(filesDir).then(function () {
            return songs
        });
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
                let writeStream = fs.createWriteStream(pathLib.join(filesDir, file._id.toString()));
                readStream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);
                readStream.pipe(writeStream)
            })
        })
    })

    .then(function (results) {
        console.log('complete!', results);
        process.exit(0)
    })
    .catch(function (e) {
        console.error(e);
        console.error(e.stack);
        process.exit()
    });
