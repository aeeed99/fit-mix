// WE CAN USE THIS FILE IF ECHO NEST INCREASES OUR RATE LIMIT

const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const mm = require('musicmetadata')
const audioMetaData = require('audio-metadata');
var request = require('request');
var querystring = require('querystring');

var songs = [
  { artist: [ 'ZZ Ward' ],
    genre: [ 'Nu-Disco' ],
    name: '365 days (jerry folk remix)',
    extension: 'mp3',
    path: '/Users/brwneyes689/Desktop/spin-tracks/365 days (jerry folk remix).mp3',
    bpm: 110,
    key: '4m',
    comment: '11A - 110',
    __v: 0 },

  { artist: [ 'Adele' ],
    genre: [ 'Pop' ],
    name: 'Hello',
    extension: 'mp3',
    path: '/Users/brwneyes689/Desktop/spin-tracks/Adele - Hello.mp3',
    bpm: null,
    key: null,
    comment: 'vk.com/rnbspot',
    __v: 0 },
  { artist: [ 'Basic Tape' ],
    genre: [ 'Танцевальная/электронная музыка' ],
    name: 'Not Afraid',
    extension: 'mp3',
    path: '/Users/brwneyes689/Desktop/spin-tracks/Basic Tape-Not Afraid.mp3',
    bpm: null,
    key: null,
    comment: null,
    __v: 0 } ]

 songs.forEach(function(song){
    // var artist = encodeURIComponent(songs[2].artist[0].trim())
    // var title = encodeURIComponent(songs[2].name.trim())
    var artist = song.artist[0]
    var title = song.name.trim()
    console.log("artist", artist)
    console.log("title", title)
    var test = querystring.stringify({ artist: artist, title: title })
    console.log("TEST", test)

request('http://developer.echonest.com/api/v4/song/search?api_key=YZNGNAILMXXWMVLVY&' + test, function (error, response, body) {
    if (error){ console.log("YOU FUCKED UP")}
        var parseBody = JSON.parse(body)
         console.log("BODY", parseBody.response.songs)
        // console.log("title", parseBody["title"])
    if (parseBody.response.songs.length>0){
        console.log("i exist?", parseBody.response.songs)
        var testID = parseBody.response.songs[0].id
        var url ='http://developer.echonest.com/api/v4/song/profile?api_key=FILDTEOIK2HBORODV&id='+testID+'=audio_summary';
        console.log("URL", url)
        request('http://developer.echonest.com/api/v4/song/profile?api_key=FILDTEOIK2HBORODV&id='+testID+'=audio_summary', function(error, response, body){
            var parseBody = JSON.parse(body)
             console.log("BODY of TRACK", parseBody.response)

        })
   }
});

 })



