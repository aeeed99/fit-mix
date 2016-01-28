'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    artist: [],
    genre: [String],
    extension: {
        type: String
    },
    path: {
        type: String
    }

});

mongoose.model('Track', schema);
