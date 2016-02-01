'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: "No Track Name" },
  artist: { type: String, required: true, trim: true, default: "No Artist Name" },
  genre: [String],
  extension: { type: String },
  path: {type: String},
  bpm: {type: Number},
  key: {type: String},
  comment: {type: String},
  cover: {type: Buffer, select: false },
  duration: {type: Number}
});

mongoose.model('Track', schema);