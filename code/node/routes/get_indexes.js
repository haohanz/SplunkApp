// Router and Server
const debug = require('debug')('safemed:node-server');
const express = require('express');
const router = express.Router();

var service = require('../service.js').service;

router.get('/', function(req, res) {
  debug('get index!');
    req.on('data', chunk => {
        var myIndexes = service.indexes();
    debug('myindexex', myIndexes.list());
        myIndexes.fetch(function(err, myIndexes) {
            var idxList = myIndexes.list();
            var idxArr = [];
            for (var i = 0; i < idxList.length; i++) {
                idxArr.push(idxList[i].name);
            }
            res.status(200).send(JSON.stringify(idxArr));
        });
    });
});

module.exports = router;

