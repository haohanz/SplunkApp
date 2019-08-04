// Router and Server
const splunkjs = require('splunk-sdk');
const logger = require('./logger');
const debug = require('debug')('safemed:node-server');

var printUsage = function() {
    debug("Login Failed! \nUsage:", "./build.sh SPLUNK_USERNAME SPLUNK_PASSWORD");
}

var service;

// Set your username & password here
module.exports.login = function(username, password) {
	if (!(username && password)) {
		printUsage();
		process.exit(1);
	}

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

    module.exports.service = service;

    return service;
}


