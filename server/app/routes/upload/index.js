var express = require('express');
var router = express.Router();
var path = require('path');
//var post = require('./models');
var formidable = require('formidable'); //formidable is a node.js module for parsing form data, especially file uploads.
var util = require('util');
var fs = require('fs-extra');

const mongoose = require('mongoose');
//const connectToDb = require('../server/db');
const Track = require('mongoose').model('Track');
const chalk = require('chalk');
const Promise = require('bluebird');
const helper = require('../../../../bin/helper');
const metadata = require('../../../../bin/metaDataWrapper');
Promise.promisifyAll(fs);

module.exports = router;
// save the name of the file in image field
// then set the static path to directory with updated files
// (so it can be used as src)

// router.post('/', function(req, res){
//     let files = req.body.files;
// });


router.post('/', function (req, res) {
    console.log("uploading", req.body)
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received upload:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));

        new Track({
            name: fields.title
        }).save(function (e, result) {
            console.log('new track saved', result);
        });
    });

    form.on('end', function (fields, files) {
        var temp_path = this.openedFiles[0].path;
        var file_name = this.openedFiles[0].name;
        var new_location = 'uploads/'; //TBD
        fs.copy(temp_path, new_location + file_name, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("success!");
            }
        });
    });
});
