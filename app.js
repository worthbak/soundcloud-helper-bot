'use strict';

var client_id =      '29366941763.35077834212'
var client_secret =  'a804488b71b37a7940079c880529e0a7'
var command_token_soundcloudid =  'CJBWPKusyIjbGdIg8PlwGKuk'

var https = require('https');
var bodyParser = require('body-parser');
var request = require("request");
var express = require('express');
var app = express();

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// https://delegateself.com/soundcloudhelper/id
app.post('/soundcloudhelperbot/id', function(req, res) {
  var token = req.body.token; // verify the token
  if (token !== command_token_soundcloudid) {
    res.status(401);
    res.end();
    return;
  }

  var soundcloudURL = req.body.text;
  var options = { method: 'POST',
  url: 'https://delegateself.com/soundcloud/json',
  headers:
   { 'content-type': 'application/x-www-form-urlencoded',
     'postman-token': 'dc9e1ca4-632a-1fed-a11e-77aca03b1c46',
     'cache-control': 'no-cache' },
  form: { soundcloudURL: soundcloudURL } };

  request(options, function (error, response, body) {
    if (error) {
      res.status(500);
      res.send('Crud! An error occurred. Maybe check your URL?');
    };

    var parsedBody = JSON.parse(body);
    res.status(200);
    res.send('SoundCloud Track ID = ' + parsedBody.trackID);
  });

});

// auth //
app.get('/soundcloudhelperbot/auth', function(req, res) {
  // sent an auth request
  var code = req.params.code
  var constructedPath = '/api/oauth.access?client_id=' + client_id
    + '&client_secret=' + client_secret
    + '&code=' + code
    + '&redirect_uri' + 'https://delegateself.com/soundcloudhelperbot/auth'

  var options = {
    host: 'slack.com',
    path: constructedPath
  };

  https.get(options, function(slackRes) {
    var bodyChunks = [];

    slackRes.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('error', function(e) {
      // callback(e, null);
      console.error(e.stack);
      return;
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var response = JSON.parse(body)

      if (response.ok === true) {
        console.log('Autenticated ' + response.team_name);

        res.status(200);
        res.send('<h2>Good to go!</h2>');
      } else {
        console.log('Auth error: ' + response.error);

        res.status(500);
        res.send('<h2>Crap!</h2>')
      }
    });

  });

});

app.listen(6700, function() {
  console.log('listening on 6700');
});
