const dir = process.argv[2]
const fs = require('fs-extra')
const Promise = require('bluebird')
const pathLib = require('path')
const helper = require('./helper')
const _ = require('lodash')
const metadata = require('./metaDataWrapper')
Promise.promisifyAll(fs);
const mongoose = require('mongoose')
const connectToDb = require('../server/db')
const Sfx = mongoose.model('Sfx')

const filesDir = pathLib.join(process.cwd(), 'server/sfx')

const extractMetaData = function(path) {
  return helper.dirWalk(path)
    .then(function(filesNames) {
      console.log("filesNames",  filesNames)
      return filesNames.filter(helper.isMp3)
    })
    .map(function(name) {
      return metadata(name)
    })


}

const clearDb = function() {
  return Promise.map(['Sfx', 'User'], function(modelName) {
    console.log("model", modelName)
    return mongoose.model(modelName).remove()
  })
}

connectToDb.bind({ docsToSave: {} })
  .then(function(){
    //clear database
    return clearDb()
  })
  .then(function() {
    // get song metadata
    return extractMetaData(dir)
  })

  // empty the audio folder (or create it if it does not yet exists)
  .then(function(sfx) {
    console.log("returned sfx", sfx)
    this.files = sfx
    return fs.emptyDirAsync(filesDir).then(function(){
        return sfx
    });
  })
  // add DB records for each song
  .then(function(sfx){
    var promises = []
    sfx.forEach(function (sfx) {
      var newSfx = new Sfx({
        name: sfx.path.split('/').pop(),
        extension: sfx.path.split('.').pop(),
        path: sfx.path,
        duration: sfx.duration ? sfx.duration : null
      })
        promises.push(Sfx.create(newSfx))
    })
    return Promise.all(promises)
  })

  // move the files to a directory on the server
  .then(function(sfx) {
    console.log("move files")
    this.sfx = sfx
    //console.log("files", this.files)
    return Promise.map(this.sfx, function(file) {
      return new Promise(function(resolve, reject) {
        console.log("path", file.path)
        let readStream = fs.createReadStream(file.path)
        let writeStream = fs.createWriteStream(pathLib.join(filesDir, file._id.toString()))
        readStream.on('error', reject)
        writeStream.on('error', reject)
        writeStream.on('finish', resolve)
        readStream.pipe(writeStream)
      })
    })
  })

  .then(function(results) {
    console.log('complete!', results)
    process.exit(0)
  })
  .catch(function(e) {
    console.error(e)
    console.error(e.stack)
    process.exit()
  })
