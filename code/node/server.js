// Router and Server
const cors = require('cors')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const router = express.Router();
const https = require('https');
const htmlparser = require('htmlparser2');
const splunkjs = require('splunk-sdk');
//TODO: add logger
const logger = require('./logger');
const globals = require("./global");
const debug = require('debug')('safemed:node-server');
const name = 'node-server';
debug('booting %s', name);

const username = process.argv[2];
const password = process.argv[3];

var printUsage = function() {
    debug("Login Failed! \nUsage:", "./build.sh SPLUNK_USERNAME SPLUNK_PASSWORD");
}

if (!(username && password)) {
    printUsage();
    process.exit(1);
}

// Set your username & password here
var service = new splunkjs.Service({
    username: username,
    password: password,
    scheme:"https",
    host:"localhost",
    port:"8089"
});

// Print installed apps to the console to verify login
service.login(function(err, success) {
    if (err) {
        debug(err);
        printUsage();
        process.exit(1);
    }
    logger.log.info('Login was successful', {success: success});
    debug('Login was successful');
});


var subpath = "/vuln/detail/";
var options = {
    hostname: "nvd.nist.gov",
    path: ""
};


// save response into Splunk cve index
var saveCve = function(cve, response) {
    // Get the collection of indexes
    var myindexes = service.indexes();

    // Get an index to send json to
    myindexes.fetch(function(err, myindexes) {
        response.cve = cve;
        service.log(response, {index: "cve", sourcetype: "mysourcetype"}, function(err, result) {
            if (err) {
                debug(err);
            } else {
                debug("Submitted new cve: %s", cve);
            }
        });
    });
}


var processHttpsResponse = function(cve, result, res) {
    var data = "";
    result.on("data", function(chunk) {
        data += chunk;
    });

    var response = {cwe: ''};
    //TODO: make a dictionary: key=id_name, value=label_name
    var currentTag = null;
    var currentName = null;
    result.on("end", function(chunk) {
        var parser = new htmlparser.Parser({
            onopentag: function(name, attribs) {
                if (globals.ATTR_ID in attribs && globals.SET.has(attribs[globals.ATTR_ID].replace(/\-/g, '_'))){
                    currentTag = attribs[globals.ATTR_ID].replace(/\-/g, '_');
                    currentName = name;
                }
            },
            ontext: function(text){
                if (currentTag) {
                    //TODO: beautify
                    if (currentTag != globals.ADDITIONAL) {
                        response[currentTag] = text.trim().replace(/\($/, '').trim();
                        currentName = null;
                        currentTag = null;
                    } else {
                        if (!response[currentTag]) response[currentTag] = '';
                        response[currentTag] += text.trim().replace(/\($/, '') + '\n';
                    }
                }
                if (text.match(/CWE-\d+/g)){
                    response.cwe = text;
                }
            },
            onclosetag: function(tagname){
                if(tagname === currentName){
                    currentName = null;
                    currentTag = null;
                }
            },
            onend: function() {
                debug("htmlparser result:", JSON.stringify(response));
                if (res) {
                    res.send(response);
                    res.end();
                }
                if (response.cwe && response.cwe != "") {
                    saveCve(cve, response);
                }
            }
        }, {decodeEntities: true});
        parser.write(data);
        parser.end();
    });

}


var searchQuery;
var searchParams = {
    exec_mode: "normal",
    output_mode: "json",
    sort_key: "_time",
    earliest_time: "2012-06-20T16:27:43.000-07:00" //TODO
};

// check cve is not in database first
var checkCve = function(cve, callback) {
    debug("checkCve: %s", cve);
    searchQuery = `search index="cve" cve="${cve}"}`
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


router.post('/cve_search', function(req, res) {
    req.on('data', chunk => {
        var cve = JSON.parse(chunk).cve;
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
                res.send(cveRes);
                res.end();
            }
        }
        );
    });
});


router.post('/add_event', function(req, res) {
    req.on('data', chunk => {
        var evt = JSON.parse(chunk).evt;
        var idx = JSON.parse(chunk).idx;
        debug(evt);
        service.log(evt, {index: idx}, function(err, result) {
            if (err) {
                debug(err);
            }
            debug("uploaded event to index %s", idx);
            res.end();
        });
    });
});


var invalidRes = function(res) {
    res.send({message: "Invalid file format!"});
    res.end();
}


router.post('/add_file', function(req, res) {
    req.on('data', chunk => {
        try {
            chunk = JSON.parse(chunk);
        } catch (e) {
            invalidRes(res);
            return;
        }
        var lines = chunk.evts;
        var fields = chunk.fields.split(',');
        var idx = chunk.idx;
        var nums = lines.length;
        if (!(lines && idx && nums)) {
            invalidRes(res);
            return;
        }
        debug(`Add File len = ${nums}; idx = ${idx}`);
        debug("fields: ", fields);

        for (var i = 0; i < nums; i++){
            if (lines[i].length > 0) {
                values = lines[i].split(',');
                var parts = {}
                for (var j = 0; j < fields.length; j++) {
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
        res.send({message: "File uploaded!"});
        res.end();

        if (idx === globals.NEXPOSE) {
            var cveIdx = fields.indexOf("cve");
            if (cveIdx < 0) return;
            var lineIdx = 0;
            var intervalObject2 = setInterval(function () {
                if (lineIdx >= nums) {
                    debug('Finished cve upload.');
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
                                processHttpsResponse(cve, result);
                            }).on('error', function(e) {
                                debug(e);
                            });
                        } else {
                            debug(`Existing cve ${cve}`);
                        }
                    });
                }
                lineIdx++;
            }, 5000); //TODO: performance test
        }
    });
});


router.post('/add_index', function(req, res) {
    req.on('data', chunk => {
        var idx = JSON.parse(chunk).idx;
        var myIndexes = service.indexes();
        myIndexes.create(idx, {}, function(err, newIndex) {
            if (err) {
                debug(err);
            }
        });
    });
});


router.post('/get_indexes', function(req, res) {
    req.on('data', chunk => {
        var myIndexes = service.indexes();
        myIndexes.fetch(function(err, myIndexes) {
            var idxList = myIndexes.list();
            var idxArr = [];
            for (var i = 0; i < idxList.length; i++) {
                idxArr.push(idxList[i].name);
            }
            res.send(JSON.stringify(idxArr));
        });
    });
});


app.use(cors());
app.use(router);
app.set('port', process.env.PORT || 4000);

app.listen(app.get('port'), function() {
    debug('Listening on port ' + app.get('port'));
});

