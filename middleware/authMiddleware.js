const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
function tokenInit(req, res, next) {
    let token = req.cookies.token;
    if(token)
        try { req.userObj = jwt.verify(req.cookies.token, 'pepicase'); req.token = token }
        catch (err) { console.error('Token verification failed:', err.message); }
    else console.log('no token')
    next();
}

module.exports = {
    tokenInit,
};
