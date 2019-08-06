// Router and Server
const debug = require('debug')('safemed:node-server');
const express = require('express');
const router = express.Router();
const https = require('https');
const subpath = require('../global.js').subpath;
var options = require('../global.js').options;
var checkCve = require('../check_cve.js');

var processHttpsResponse = require('../http_response.js');

router.post('/', function(req, res) {
    req.on('data', chunk => {
        try {
            var cve = JSON.parse(chunk).cve;
        } catch (e) {
            res.status(400).send({message: "Invalid cve!"});
            debug("cve is invalide: " + cve);
            return;
        }
        if (cve === undefined) {
            res.status(200).send({message: 'empty'});
            res.end();
            return;
        }
        options.path = subpath + cve;
        checkCve(cve, function(cveRes) {
            if (!cveRes) {
                debug(`New cve ${cve}`);
                https.get(options, function (result) {
                    processHttpsResponse(cve, result, res);
                }).on('error', function(e) {
                    debug(e);
                });
            } else {
                debug("Existing cve %s", cve);
                res.status(200).send(cveRes);
                res.end();
            }
        }
        );
    });
});

module.exports = router;

