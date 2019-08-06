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
const globals = require("./global");
const debug = require('debug')('safemed:node-server');

var saveCve = require('./save_cve.js');

var processHttpsResponse = function(cve, result, res) {
    var data = "";
    result.on("data", function(chunk) {
        data += chunk;
    });

    var response = {cwe: ''};
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
                if (response.cwe && response.cwe != "") {
                    res.status(200);
                    saveCve(cve, response);
                } else {
                    res.status(404);
                }
                if (res) {
                    try {
                        res.send(response);
                        res.end();
                    } catch (e) {
                        debug(e);
                    }
                }
            }
        }, {decodeEntities: true});
        parser.write(data);
        parser.end();
    });

}


module.exports = processHttpsResponse;
