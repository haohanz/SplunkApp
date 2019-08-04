// Router and Server
const cors = require('cors')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const router = express.Router();
const https = require('https');
const htmlparser = require('htmlparser2');
const splunkjs = require('splunk-sdk');
const globals = require("./global");
const debug = require('debug')('safemed:node-server');
const name = 'node-server';
debug('booting %s', name);

const username = process.argv[2];
const password = process.argv[3];

const service = require('./service.js').login(username, password);

app.use(cors());
app.use(router);
app.use(require('./routes'));
app.set('port', process.env.PORT || 4000);

app.listen(app.get('port'), function() {
    debug('Listening on port ' + app.get('port'));
});

