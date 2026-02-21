const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');

router.get('/items', searchController.getSearchResults);

module.exports = router;
