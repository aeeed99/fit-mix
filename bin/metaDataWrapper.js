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
    var passedData={};
    console.log("at metadata", name)
    var parser = mm(fs.createReadStream(name), { duration: true }, function (err, metadata) {
        console.log("starting on: " + name + " hopefully this indicates the bad file");
        if(err) return reject(err);
        console.log("metadata", metadata);
        passedData.artist = metadata.artist ? metadata.artist[0] : 'Unknown Artist';
        passedData.name = metadata.title ? metadata.title : 'undefined';
        passedData.genre = metadata.genre ? metadata.genre : 'undefined';
        passedData.path = name;
        passedData.duration = metadata.duration;

        passedData.picture = metadata.picture[0]  ? metadata.picture[0] : { data: new Buffer(0), format: 'jpg' };
        var x = new Buffer(passedData.picture.data.length);
        passedData.picture.data = passedData.picture.data.copy(x);
        passedData.picture.data = x;

        console.log("final data", passedData);

        resolve(passedData);

    });

    parser.on('TBPM', function (result) {
      console.log("I FOUND A TBPM", result );
      passedData.bpm = result;
    })

    parser.on('TKEY', function (result) {
      console.log("I FOUND A TKEY", result );
      passedData.key = result;
    })

    parser.on('COMM', function (result) {
      console.log("I FOUND A Comment", result );
      passedData.comment = result.text
    })
  })
}






