var express = require('express');
var router = express.Router();
var authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.tokenInit, function(req, res, next) {
    res.render('pepi-index', { userObj: req.userObj });
});

module.exports = router;