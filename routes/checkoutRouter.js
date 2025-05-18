var express = require('express');
var router = express.Router();
const connection = require('../db/connection');

var authMiddleware = require('../middleware/authMiddleware')
router.get('/', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj) return res.redirect('./login?action=checkout');
    else connection.
    query(`SELECT cart_details.id as cart_item_id, cart_details.cart_id as cart_id, cart_details.product_id, product.name, size, quantity, product.price, product.image, product.isdeleted
    FROM cart_details LEFT JOIN product ON cart_details.product_id = product.id LEFT JOIN cart ON cart.id = cart_details.cart_id
    WHERE cart.user_id = ?;`, [req.userObj.id], (err, results) => {
        if(err) return res.status(500).send(err);
        else if(results.length === 0) return res.render ('empty_cart', { userObj: req.userObj })
        else {
            let total = 0; 
            results.forEach(item => total += item.price * item.quantity);
            return res.render('checkout', { userObj: req.userObj, cartItems: JSON.stringify(results), total: total });
        }
    })
});

router.get('/done', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj) return res.redirect('/');
    res.render('checkout_done', { userObj: req.userObj, err: req.query.err ? true : false })
})

router.post('/check-discount', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj) return res.redirect('/login?action=checkout')
    if(req.body.voucher_code) {
        connection.query(`SELECT discount_value, ID FROM voucher WHERE Name = ? 
        AND End_Date > CURRENT_DATE AND CURRENT_DATE > Start_Date AND Current_Usage < Max_Usage`, [req.body.voucher_code], (err, results) => {
            if(err) {
                console.log(err);
                return res.status(500).send(err);
            }
            else if (results.length === 0) return res.json({discount_value: 0})
            else return res.json({discount_value: results[0].discount_value})
        })
    }
});

router.post('/generate-invoice', authMiddleware.tokenInit, (req, res) => {
    if(!req.userObj) return res.redirect('/login?action=checkout');
    const { total_price, actual_price, voucher_id, user, note, method, firstName, lastName, address, phone } = req.body, cart_items = JSON.parse(req.body.cart_items);
    let email = req.userObj.email;
    connection.beginTransaction(err => {
        if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
        connection.query(`INSERT INTO invoice (user_id, voucher_id, first_name, last_name, phone, email, ship_address, payment_method, note, total_price, actual_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`, 
            [user, voucher_id ? voucher_id : null, firstName, lastName, phone, email, address, method, note, total_price, actual_price], (err, results) => {
            if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
            const values = cart_items.map(item => [ results.insertId, item.product_id, item.name, item.quantity, item.price, item.size ])
            connection.query(`INSERT INTO invoice_details (invoice_id, product_id, name_product, quantity, price, size) VALUES ?`,
            [values], (err) => {
                if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
                const toDelete = cart_items.map(item => item.cart_item_id);
                connection.query(`DELETE FROM cart_details WHERE id IN (?)`, [toDelete], (err) => {
                    if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
                    connection.query(`DELETE FROM cart WHERE user_id = ?`, [user], (err) => {
                        if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
                        connection.commit(err => {
                            if(err) { console.error(err); return connection.rollback(() => res.status(200).json({ url: '/checkout/done?err=true'})) }
                            else return res.status(200).json({ url: '/checkout/done' });
                        })
                    })
                })
            })
        })
    })
})

module.exports = router;
