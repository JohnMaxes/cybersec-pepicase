var express = require('express');
var router = express.Router();

MAX_ATTEMPTS = 5;

var authMiddleware = require('../middleware/authMiddleware')
const connection = require('../db/connection');
const redisClient = require('../db/redis');

const jwt = require('jsonwebtoken');

router.get('/', authMiddleware.tokenInit, function(req, res) {
    res.clearCookie('token');
    if (req.userObj) return res.redirect('/');
    else res.render('signup', { userObj: req.userObj, error: req.query.error });
});

router.get('/check-username', function(req, res) {
    
})



/*
router.post('/', express.urlencoded({ extended: true }), async function(req, res) {
    const ip = req.ip, { username, password } = req.body;
    const isBanned = await redisClient.exists(`ip:${ip}:banned`), usernameBanned = await redisClient.exists(`username:${username}:banned`);
    if(isBanned || usernameBanned) return res.status(403).send('You are temporarily banned');
    if (username && password) {
        connection.query('SELECT * FROM USER WHERE username = ? AND password = ?', [username, password], async (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).send('Internal server error');
            }
            if (results.length === 0) {
                // IP tracking
                let ipCounter = await redisClient.exists(`ip:${ip}:login_attempts`);
                if(!ipCounter) await redisClient.set(`ip:${ip}:login_attempts`, 1, { EX: 300 }); 
                else await redisClient.incr(`ip:${ip}:login_attempts`).then( async (newValue) => {
                    if(newValue > MAX_ATTEMPTS) {
                        await redisClient.set(`ip:${ip}:banned`, 1, {EX: 300})
                        return res.status(403).send('You are temporarily banned');
                    }
                });
                // Username tracking
                let usernameExists = await redisClient.exists(`username:${username}:login_attempts`);
                if (!usernameExists) await redisClient.set(`username:${username}:login_attempts`, 1, { EX: 300 });
                else await redisClient.incr(`username:${username}:login_attempts`).then( async (newValue) => {
                    if (newValue > MAX_ATTEMPTS) {
                        await redisClient.set(`username:${username}:banned`, 1, { EX: 300 });
                        return res.status(403).send('Too many failed attempts for this username. Try again later.');
                    }
                })       
                return res.redirect(302, '../login?error=Incorrect%20email%20or%20password.');
            }
            else {
                console.log(results[0].Username);
                const token = jwt.sign({ id: results[0].id, username: results[0].username }, 'pepicase');
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'Lax',
                    maxAge: 300000,
                    path: '/',
                });
                redisClient.del(`ip:${ip}:login_attempts`)
                redisClient.del(`username:${username}:login_attempts`);
                if(req.query.action) return res.redirect(302, '../' + req.query.action);
                else return res.redirect(302, '../');
            }
        });
    } else res.status(400).send('Bad request!');
});
*/

module.exports = router;
