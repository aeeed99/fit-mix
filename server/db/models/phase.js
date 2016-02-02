var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    duration: Number // NP: in seconds, just like track property
});

mongoose.model('Phase', schema);