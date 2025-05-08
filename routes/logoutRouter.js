var express = require('express');
var router = express.Router();

var authMiddleware = require('../middleware/authMiddleware')
router.get('/', authMiddleware.tokenInit, function(req, res) {
    res.clearCookie('token');
    return res.redirect('/');
});

module.exports = router;
