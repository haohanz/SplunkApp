// Router and Server
const cors = require('cors')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const router = express.Router();
const https = require('https');
const htmlparser = require('htmlparser2');
const splunkjs = require('splunk-sdk');
const logger = require('./logger');
const debug = require('debug')('safemed:node-server');
const name = 'node-server';
debug('booting %s', name);

var service = require('./service.js').service;
var searchParams = require('./global.js').searchParams;

// check cve is not in database first
var checkCve = function(cve, callback) {
    debug("checkCve: %s", cve);
    searchQuery = `search index="cve" cve="${cve}"}`;
    var res = null;

    service.search(
            searchQuery,
            searchParams,
            function(err, job) {
                // Poll the status of the search job
                job.track({period: 200}, {
                    done: function(job) {
                        // Get the results and print them
                        job.results({}, function(err, results, job) {
                            var fields = results.fields;
                            var rows = results.rows;
                            if (rows.length == 0) {
                                // Incomplete record, start http request
                                callback(null);
                            } else {
                                // Get the latest record, sort by _time
                                var raw = rows[0][fields.indexOf("_raw")];
                                var jsRaw;
                                try {
                                    jsRaw = JSON.parse(raw);
                                    debug("Found existing record: ", JSON.stringify(jsRaw));
                                } catch (e) {
                                    debug(e);
                                    callback(null);
                                    return;
                                }
                                if (!jsRaw['cwe'] || !jsRaw['vuln_description']) {
                                    // missing fields
                                    callback(null);
                                } else {
                                    callback(jsRaw);
                                }
                            }
                        });
                    },
                    failed: function(job) {
                        debug("Job failed");
                        callback(null);
                    },
                    error: function(err) {
                        done(err);
                        callback(null);
                    }
                });
            });
}



module.exports = checkCve;
