var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var nodemailer = require("nodemailer");
var Appbase = require('appbase-js');

/*
  Appbase Credentials. Just make new account at appbase and configure it according to your account.
*/
var appbase = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'testgsoc',
  username: 'JxGrCcfHZ',
  password: '1c46a541-98fa-404c-ad61-d41571a82e14'
});

/*
  Initialize user and pass with any correct credentials in order to send mail.
*/
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
});

function send_mail(mail)
{
    console.log(mail);
    transporter.sendMail(mail, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
}

/* This is to access any file withn folder, no routing required for these files. */
app.use('/', express.static(__dirname + '/'));

/* This is pointing to ROOT of the application i.e index.html */
app.get('/', function (req, res) {
  fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

/* Price alert routing. The Client side makes the ajax call to this route with 
   params [alert_price,email] and as soon as the price gets equal to the 
   alert_price then this routes sends the email. 
*/
app.get('/alerting', function (req, res) {
  console.log(req.param('price'));
  var app_base = new Appbase({
    url: 'https://scalr.api.appbase.io',
    appname: 'testgsoc',
    username: 'JxGrCcfHZ',
    password: '1c46a541-98fa-404c-ad61-d41571a82e14'
  });
  app_base.streamSearch({
    type: 'bitcoin_price',
    body:{
      "query":{
        "match" : {
          "last" : parseFloat(req.param('price'))
        }
      }
    }
  }).on('data', function(response) {
    console.log(response);
    console.log(req.param('price'));
    console.log(req.param('email'));
    if(response.hits == undefined || response.hits.total == 1){
      var mail = {
        /*
          Here change the from field and set it to some valid account.
        */
        from: "puneet.241994.agarwal@gmail.com",
        to: req.param('email'),
        subject: "Alert!! - Bitcoin Price changed",
        text: "Current Bitcoin Price in USD :- "+req.param('price'),
        html: "<b>Current Bitcoin Price in USD :- "+req.param('price')+"</b>"
      }
      send_mail(mail);
    }
  }).on('error', function(error) {
    console.log(error)
  })
});

/* It will start the server. */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Bitcoin Price Alert app listening at http://%s:%s', host, port);
});
