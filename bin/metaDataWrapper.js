const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const mm = require('musicmetadata')

/*
Omri & Zeke:
  We needed to write a wrapper around `musicmetadata` because
  of a bug we discovered in their use of a single reused buffer
  for all of their album art work. album <-> art <-> song  assoc
  was incorrect.
*/


module.exports = function(name) {
  return new Promise(function(resolve, reject) {
    mm(fs.createReadStream(name), function(err, metadata) {
      console.log("meta", name, metadata)
   if (err) console.warn('An error occured while reading ' + name + ' id3 tags.'); // warn instead of throw err;
      metadata.path = name

    if(metadata.artist.length === 0) metadata.artist = ['Unknown artist'];
    if(metadata.album === null || metadata.album === '') metadata.album = 'Unknown';
    if(metadata.title === null || metadata.title === '') metadata.title = path.parse(name).base;
        console.log("new data", metadata)
      resolve(metadata)
    })
  })
}



