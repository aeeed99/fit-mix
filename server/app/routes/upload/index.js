var express = require('express');
var router = express.Router();
var post = require('./models');
var formidable = require('formidable'); //formidable is a node.js module for parsing form data, especially file uploads.
var util = require('util');
var fs = require('fs-extra');

// save the name of the file in image field
// then set the static path to directory with updated files
// (so it can be used as src)

router.post('/upload', function (req, res) {
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

        new track({
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
