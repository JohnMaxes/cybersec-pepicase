var express = require('express');
var path = require('path');
var router = express.Router();
var authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.tokenInit, function(req, res) {
    res.render('index', { userObj: req.userObj });
});

module.exports = router;