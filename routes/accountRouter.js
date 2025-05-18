var express = require('express');
var router = express.Router();

var authMiddleware = require('../middleware/authMiddleware')
const connection = require('../db/connection');
const csrfTokenMiddleware = require('../middleware/csrfTokenMiddleware')
router.use(authMiddleware.tokenInit);

router.get('/', function(req, res) {
    if(!req.userObj) res.redirect('./login?action=account');
    else connection.query('SELECT * FROM user_info WHERE user_id = ?', req.userObj.id, (err, results) => {
        if(err) res.status(500).send(err);
        else if(results.length === 0) res.status(401).send('User not found!');
        else res.render('account', { userObj: req.userObj, userInfo: results[0], 
            csrfToken: csrfTokenMiddleware.generateCsrfToken(req.token)
        });
    })
});

const checkInf = (first_name, last_name, email, phone, address) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const addressRegex = /^(?=.*[a-zA-ZÀ-ỹ])(?=.*\d)[a-zA-ZÀ-ỹ0-9\s,#\-./]+$/;
    const phoneRegex = /^\d{6,15}$/;

    if (!first_name || !nameRegex.test(first_name.trim())) return false;
    if (!last_name || !nameRegex.test(last_name.trim())) return false;
    if (!email || !emailRegex.test(email.trim())) return false;
    if (!address || !addressRegex.test(address.trim())) return false;
    if (!phone || !phoneRegex.test(phone.trim())) return false;

    return true;
};

router.post('/', express.urlencoded({ extended: true }), function(req, res) {
    let csrfTokenValid = csrfTokenMiddleware.validateCsrfToken(req.token, req.body.csrfToken);
    if(!req.userObj || !csrfTokenValid ) res.status(403).send('Unauthorized');
    const { first_name, last_name, email, phone, address } = req.body, user_id = req.userObj.id;
    if (checkInf(first_name, last_name, email, phone, address) && user_id) {
        let result_length, query;
        connection.query(`SELECT * FROM user_info WHERE user_id = ?`, user_id, (err, results) => {
            if (err) {
                console.error('Error editing creds:', err);
                return res.status(500).send('Internal server error');
            }
            result_length = results.length;
            query = (result_length == 1) ? 
            `UPDATE user_info SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${user_id}`
            : `INSERT INTO user_info (user_id, first_name, last_name, email, phone_number, address, updated_at) VALUES (${user_id}, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
            connection.query(query, [first_name, last_name, email, phone, address], (err, results) => {
                if (err) {
                    console.error('Error editing creds:', err);
                    return res.status(500).send('Internal server error');
                }
                console.log('Info updated');
                return res.status(200).json({ message: "Account updated!" });
            });
        })
    }
    else return res.status(400).send('Bad request!');
});

router.get('/delete', express.urlencoded({ extended: true }), (req, res) => {
    if (!req.userObj) return res.status(403).send('Unauthorized');
    connection.beginTransaction(err => {
        if (err) return res.status(500).send('Internal server error');
        connection.query('DELETE FROM user_info WHERE user_id = ?', [req.userObj.id], (err) => {
            if (err) return connection.rollback(() => res.status(500).send('Internal server error'));
            connection.query('DELETE FROM user WHERE id = ?', [req.userObj.id], (err) => {
                if (err) return connection.rollback(() => res.status(500).send('Internal server error'))
                connection.commit(err => {
                    if (err) return connection.rollback(() => res.status(500).send('Internal server error'))
                    res.clearCookie('token');
                    return res.status(302).redirect('../');
                });
            });
        });
    });
});


module.exports = router;
