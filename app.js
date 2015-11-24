var express = require('express');
var http = require('http');
var path = require('path');
var AWS = require('aws-sdk');
var fs = require('fs');
var multer = require('multer');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;
var s3 = new AWS.S3();


var app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({
    dest: './uploads/'
}));

app.get('/assignments', function(req, res) {
    res.render('assignments.html');
});

app.get('/', function(req, res) {
    res.render('assignments.html');
});

app.post('/submit_form', function(req, res) {
    var rstream = fs.createReadStream(req.files['file_input'].path);
    var params = {
        Bucket: S3_BUCKET,
        Key: req.body.class_name + '/' + req.body.full_name + '/' + req.files['file_input'].originalname,
        Body: rstream
    };
    var upload = s3.upload(params);
    upload.send(function(err, data) {
        if (err) {
            throw err;
            // send them somewhere with an error and my email
        } else {
            //send them to a thanks page or something
            rstream.close();
            fs.unlink(req.files['file_input'].path);
            res.render('thanks.html');
        }
    });
});

app.listen(app.get('port'));
