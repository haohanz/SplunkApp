// Router and Server
const debug = require('debug')('safemed:node-server');
const express = require('express');
const router = express.Router();

var service = require('../service.js').service;

router.get('/', function(req, res) {
    req.on('data', chunk => {
        try {
            var evt = JSON.parse(chunk).evt;
            var idx = JSON.parse(chunk).idx;
            service.log(evt, {index: idx}, function(err, result) {
                if (err) {
                    res.status(400).send(err);
                    res.end();
                } else {
                    debug("uploaded event to index %s", idx);
                    res.status(200).send({message: "Added event!"});
                    res.end();
                }
            });
        } catch (e) {
            debug("add_event failed!");
            res.status(400).send({message: "Adding event Failed!"});

        }
    });
});

module.exports = router;

