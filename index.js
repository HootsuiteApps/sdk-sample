'use strict';
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const sha512 = require('js-sha512');
var Twitter = require('twit');

const app = express();

var secret = '';

// client for hydrating twitter data - ADD YOUR OWN CREDENTIALS
var twitterClient = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendFakeMessages(socket) {
  // emit a scripted set of messages
  await sleep(2000);
  socket.emit('stream update', 'hello!');
  await sleep(2000);
  socket.emit('stream update', 'hey, how are you?');
  await sleep(2000);
  socket.emit('stream update', 'i\'m good thanks, how are you?');
  await sleep(2000);
  socket.emit('stream update', 'i\'m good too');
}

// Create a file called secret.txt and paste your secret into it,
// use an environment variable, or save it in another secure way.
// Make sure not to push it version control!
try {
  secret = fs.readFileSync('secret.txt').toString();
} catch (err) {
  console.log('You must create a secret.txt file and populate it as described in the README');
}

app.get('/gen-token', (req, res) => {
  // Combines information to create an auth token
  // Auth token is retrieved by an AJAX request from stream.js
  if (secret === '') {
    console.log('Token generation failed because of missing shared secret');
    res.status(500).send({error: 'Token generation failed because of missing shared secret'});
  } else {
    res.send(sha512(req.query.userId.toString() +
                    req.query.timestamp.toString() +
                    req.query.url.toString() + secret));
  }
});

app.post('/stream', (req, res) => {
	res.sendFile(__dirname + '/stream.html');
});

app.get('/stream', (req, res) => {
	res.sendFile(__dirname + '/stream.html');
});

app.use('/assets', express.static('assets'));

app.post('/plugin', (req, res) => {
  res.sendFile(__dirname + '/plugin.html');
});

app.get('/modal', (req, res) => {
  res.sendFile(__dirname + '/modal.html');
});

// GET /twitterAccounts?account_ids=<comma,separated,ids>
app.get('/twitterAccounts', (req, res) => {
  // there is, of course, better ways to do this
  if (req.header('secretKey') == 'super_secret') {
    var accountIds = req.query.accountIds;
    if (!accountIds) {
      res.sendStatus(400);
      return;
    } else {
      twitterClient.get('users/lookup', { user_id: accountIds })
        .catch(function(err) {
          console.log('caught error', err.stack);
        })
        .then(function (result) {
          var accountNames = result.data.map(function(account) {
            return account.name
          });
          res.send(accountNames);
          return;
        });
    }
  } else {
    res.sendStatus(401);
  }
});

// GET /tweets/<id>
app.get('/tweets/:tweetId', (req, res) => {
  if (req.header('secretKey') == 'super_secret') {
    if (!req.params.tweetId) {
      res.sendStatus(400);
      return;
    } else {
      twitterClient.get('statuses/show', { id: req.params.tweetId })
        .catch(function(err) {
          console.log('caught error', err.stack);
        })
        .then(function (result) {
          res.send(result.data);
          return;
        });
    }
  } else {
    res.sendStatus(401);
  }
});

// All Hoosuite apps require HTTPS, so in order to host locally
// you must have some certs. They don't need to be issued by a CA for development,
// but for production they definitely do! Heroku adds its own TLS,
// so you don't have to worry about it as long as TLS is enabled on your Heroku app.
if (fs.existsSync('certs/server.crt') && fs.existsSync('certs/server.key')) {
  const certificate = fs.readFileSync('certs/server.crt').toString();
  const privateKey = fs.readFileSync('certs/server.key').toString();
  const options = {key: privateKey, cert: certificate};

  var server = https.createServer(options, app).listen(process.env.PORT || 5000);
  console.log(`Example app listening on port ${process.env.PORT || 5000} using HTTPS`);
} else {
  var server = http.createServer(app).listen(process.env.PORT || 5000);
  console.log(`Example app listening on port ${process.env.PORT || 5000}`);
}

const io = require('socket.io')(server);

io.on('connection', function (socket) {
  sendFakeMessages(socket);
  socket.on('restart', function(data) {
    sendFakeMessages(socket);
  });
});
