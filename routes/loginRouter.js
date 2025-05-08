var express = require('express');
var router = express.Router();

MAX_ATTEMPTS = 5;

var authMiddleware = require('../middleware/authMiddleware')
const connection = require('../db/connection');
const redisClient = require('../db/redis');
const emailService = require('../utils/emailService');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

router.get('/', authMiddleware.tokenInit, function(req, res) {
    if (req.userObj) return res.redirect('/');
    else res.render('login', { userObj: req.userObj, action: req.query.action, error: req.query.error });
});

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
                        await redisClient.setEx(`username:${username}:banned`, 300, 1);
                        return res.status(403).send('Too many failed attempts for this username. Try again later.');
                    }
                })       
                return res.status(200).json({ error: 'Incorrect email or password.'});
            }
            else {
                const isTrusted = await redisClient.sIsMember(`username:${username}:trusted_ips`, ip);
                const trustToken = req.cookies?.trusted;
                const hasValidTrustToken = !!(trustToken && (await redisClient.get(`trust:${trustToken}`)) === username);
                if(!isTrusted && !hasValidTrustToken) {
                    let secret = crypto.randomBytes(32).toString('hex');
                    let link = generateAuthenticationLink(results[0].id, results[0].username, secret, ip);
                    await redisClient.setEx(`2fa:${username}`, 300, secret);
                    emailService.sendAuthenticationEmail(results[0].email, link)
                        .catch(err => console.error('Failed to send email:', err));
                    return res.redirect(`/login?error=${encodeURI('New login location detected, check your email.')}`)
                }
                const token = jwt.sign({ id: results[0].id, username: results[0].username }, 'pepicase');
                res.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'Lax',
                    maxAge: 300000,
                    path: '/',
                });
                await redisClient.del(`ip:${ip}:login_attempts`)
                await redisClient.del(`username:${username}:login_attempts`);
                if(req.query.action) return res.redirect('../' + req.query.action);
                else return res.redirect('../');
            }
        });
    } else res.status(400).send('Bad request!');
});

function generateAuthenticationLink(id, username, secret) {
    return `http://localhost:3000/login/authenticate?id=${id}&username=${encodeURIComponent(username)}&secret=${secret}`;
}

function generateTrustToken(username) {
    const secret = crypto.randomBytes(32).toString('hex');
    const base = `${username}:${Date.now()}:${secret}`;
    return crypto.createHash('sha256').update(base).digest('hex');
}

router.get('/authenticate', authMiddleware.tokenInit, async function(req, res) {
    if (req.userObj) return res.redirect('/');
    let ipBanned = await redisClient.get(`ip:${req.ip}:2fabanned`),
    usernameBanned = await redisClient.get(`username:${req.query.username}:2fabanned`);
    if(ipBanned || usernameBanned) return res.status(404).send('Not Found');
    if(req.query.id && req.query.username && req.query.secret) {
        let svSecret = await redisClient.get(`2fa:${req.query.username}`);
        if( svSecret == req.query.secret ) {
            await redisClient.sAdd(`username:${req.query.username}:trusted_ips`, req.ip)
            const token = jwt.sign({ id: req.query.id, username: req.query.username }, 'pepicase');
            res.cookie('token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 300000, path: '/' });
            const trustToken = generateTrustToken(req.query.username);
            await redisClient.setEx(`trust:${trustToken}`, 60 * 60 * 24 * 30, req.query.username);
            res.cookie('trusted', trustToken, { httpOnly: true, sameSite: 'Lax', maxAge: 2592000000, path: '/' });
            await redisClient.del(`2fa:${req.query.username}`);
            await redisClient.del(`ip:${req.ip}:login_attempts`);
            await redisClient.del(`username:${req.query.username}:login_attempts`);
            return res.redirect('/');
        }
    }
    // IP tracking
    let ipCounter = await redisClient.exists(`ip:${req.ip}:2fa_attempts`);
    if(!ipCounter) await redisClient.set(`ip:${ip}:2fa_attempts`, 1, { EX: 300 }); 
    else await redisClient.incr(`ip:${ip}:2fa_attempts`).then( async (newValue) => {
        if(newValue > MAX_ATTEMPTS) await redisClient.set(`ip:${req.ip}:2fabanned`, 1, {EX: 300});
    });
    // Username tracking
    let usernameExists = await redisClient.exists(`username:${req.query.username}:2fa_attempts`);
    if (!usernameExists) await redisClient.set(`username:${req.query.username}:2fa_attempts`, 1, { EX: 300 });
    else await redisClient.incr(`username:${username}:2fa_attempts`).then( async (newValue) => {
        if (newValue > MAX_ATTEMPTS) await redisClient.setEx(`username:${req.query.username}:2fabanned`, 300, 1);
    })
    return res.status(404).send('Not Found');
});


module.exports = router;