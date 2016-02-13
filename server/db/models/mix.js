'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        default: "My Awesome FitMix"
    },
    tracks: {
        type: [{}]
    },
    effects: {
        type: [{}]
    },
    length: {
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Mix', schema);
