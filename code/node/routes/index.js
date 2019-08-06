
const express = require('express');
const router = express.Router();

router.use('/cve_search', require('./cve_search.js'));
router.use('/add_event', require('./add_event.js'));
router.use('/get_indexes', require('./get_indexes.js'));
router.use('/add_index', require('./add_index.js'));
router.use('/add_file', require('./add_file.js'));

module.exports = router;
