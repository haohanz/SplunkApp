// Router and Server
const debug = require('debug')('safemed:node-server');
const express = require('express');
const router = express.Router();
const https = require('https');

var service = require('../service.js').service;
var globals = require('../global.js');
var checkCve = require('../check_cve.js');
var processHttpsResponse = require('../http_response.js');
var options = globals.options;
var subpath = globals.subpath;

router.post('/', function(req, res) {
    req.on('data', chunk => {
        try {
            chunk = JSON.parse(chunk);
            var lines = chunk.evts;
            var fields = chunk.fields.split(',');
            var idx = chunk.idx;
            var nums = lines.length;
            if (!(lines && idx && nums)) {
                res.status(400).send({message: "Invalid file format!"});
                return;
            }
            debug(`Add File len = ${nums}; idx = ${idx}`);
            debug("fields: ", fields);

            for (var i = 0; i < nums; i++){
                if (lines[i].length > 0) {
                    values = lines[i].split(',');
                    var parts = {}
                    for (var j = 0; j < Math.min(fields.length, values.length); j++) {
                        parts[fields[j]] = values[j];
                    }
                    service.log(parts, {index: idx}, function(err, result) {
                        if (err) {
                            debug(err);
                        }
                    });
                }
            }

            debug(`Uploaded ${i} lines to index ${idx}`);
            res.status(200).send({message: "File uploaded!"});
            res.end();
        } catch (e) {
            res.status(400).send({message: "Invalid file format!"});
            return;
        }

        if (idx === globals.NEXPOSE) {
            var cveIdx = fields.indexOf("cve");
            if (cveIdx < 0) return;
            var lineIdx = 0;
            var intervalObject2 = setInterval(function () {
                if (lineIdx >= nums) {
                    debug('Finished cve processing.');
                    clearInterval(intervalObject2);
                    return;
                }
                var cve = lines[lineIdx].split(',')[cveIdx];
                if (!cve || !cve.toLowerCase().match(/cve-\d+-\d+/g)) {
                    debug(`cve ${cve} format error`);
                } else {
                    checkCve(cve, function(cveRes) {
                        if (!cveRes) {
                            debug(`New cve ${cve}`);
                            options.path = subpath + cve;
                            https.get(options, function (result) {
                                processHttpsResponse(cve, result, res);
                            }).on('error', function(e) {
                                debug(e);
                            });
                        } else {
                            debug(`Existing cve ${cve}`);
                        }
                    });
                }
                lineIdx++;
            }, 5000);
        }
    });
});


module.exports = router;

