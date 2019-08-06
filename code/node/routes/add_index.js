// Router and Server
const debug = require('debug')('safemed:node-server');
const express = require('express');
const router = express.Router();

var service = require('../service.js').service;

router.get('/', function(req, res) {
    req.on('data', chunk => {
        try {
            var idx = JSON.parse(chunk).idx;
            if (idx === undefined) {
                res.status(400).send({message: "Empty Request."});
                res.end();
            } else {
                var myIndexes = service.indexes();
                myIndexes.create(idx, {}, function(err, newIndex) {
                    if (err) {
                        res.status(409).send({message: "Index already exists!"});
                        res.end();
                    } else {
                        res.status(200).send({message: "Index created!"});
                        res.end();
                    }
                });
            }
        } catch (e) {
            res.status(400).send({message: "Create Index Failed!"});
            res.end();
        }
    });
});

module.exports = router;

