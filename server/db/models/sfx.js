'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: "SFX"
    },
    extension: {
        type: String
    },
    path: {
        type: String
    },
    duration: {
        type: Number
    },
    file: {
        mime: String,
        bin: Buffer
    }
});

mongoose.model('Sfx', schema);
