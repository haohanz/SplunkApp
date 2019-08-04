// Router and Server
const logger = require('./logger');
const debug = require('debug')('safemed:node-server');

var service = require('./service.js').service;

// save response into Splunk cve index
module.exports = function(cve, response) {
    // Get the collection of indexes
    var myindexes = service.indexes();

    // Get an index to send json to
    myindexes.fetch(function(err, myindexes) {
        response.cve = cve;
        if (service === undefined) return false;
        service.log(response, {index: "cve", sourcetype: "mysourcetype"}, function(err, result) {
            if (err) {
                debug(err);
                return false;
            } else {
                debug("Submitted new cve: %s", cve);
                return true;
            }
        });
    });
}

