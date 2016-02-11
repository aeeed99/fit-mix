var express = require('express');
var router = express.Router();
var path = require('path');
//var post = require('./models');
var formidable = require('formidable'); //formidable is a node.js module for parsing form data, especially file uploads.
var util = require('util');
var fs = require('fs-extra');
var multer = require('multer');
var uploading = multer({
  dest: __dirname + '../../../../uploads/',
})

const mongoose = require('mongoose');
//const connectToDb = require('../server/db');
const Track = require('mongoose').model('Track');
const chalk = require('chalk');
const Promise = require('bluebird');
const helper = require('../../../../bin/helper');
const metadata = require('../../../../bin/metaDataWrapper');
Promise.promisifyAll(fs);

// save the name of the file in image field
// then set the static path to directory with updated files
// (so it can be used as src)

// router.post('/', function(req, res){
//     let files = req.body.files;
// });


router.post('/', uploading.single('track'), function (req, res, next) {
console.log("tracks", req.body)
});


module.exports = router;
