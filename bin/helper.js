const pathLib = require('path')
const fs = require('fs')
const Promise = require('bluebird')
Promise.promisifyAll(fs)
const crypto = require('crypto')
module.exports = {
  getSha1:  function(val) {
    let shasum = crypto.createHash('sha1');
    shasum.update(val)
    return shasum.digest('hex')
  },
  isMp3: (path) => ['.mp3','.m4a','.mp4','.wav'].includes(pathLib.extname(path)),
  //should this method be named `isValid`? Looks like that is more its intention.


  dirWalk: function dirWalk(all, root) {
    if (!root) {
        root = all;
        all = [];
    }
    function add (elem) {
        all.push(elem);
        return all;
    }
    function fullPath (filepath) {
        return root + '/' + filepath;
    }
    return fs.statAsync(root)
    .then(function (stats) {
        if (stats.isDirectory()) {
            return fs.readdirAsync(root)
            .map(fullPath)
            .reduce(dirWalk, all);
        } else if (stats.isFile()) {
            return add(root)
        }
    });
}


}
