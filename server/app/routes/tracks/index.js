'use strict';
var router = require('express').Router();
var _ = require('lodash');
var request = require('request');
module.exports = router;

router.get('/', function (req, res, next) {
    console.log("trying to get tracks")
    var trackBuffer = null;
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    function loadTrackSound(url) {
      var request = new XMLHttpRequest();
      request.open('GET', '~/server/audio/WerkinGirls.wav', true);
      request.responseType = 'arraybuffer';

      // Decode asynchronously
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          trackBuffer = buffer;
        }, onError);
      }
      request.send();
    }

});
