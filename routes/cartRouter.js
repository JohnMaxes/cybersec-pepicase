var express = require('express');
var router = express.Router();
const connection = require('../db/connection');

var authMiddleware = require('../middleware/authMiddleware')
router.get('/', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj) return res.redirect('./login?action=cart');
    else connection.
    query(`SELECT cart_details.id as cart_item_id, cart_details.cart_id as cart_id, cart_details.product_id, product.name, size, quantity, product.price, product.image, product.isdeleted
    FROM cart_details LEFT JOIN product ON cart_details.product_id = product.id LEFT JOIN cart ON cart.id = cart_details.cart_id
    WHERE cart.user_id = ?;`, [req.userObj.id], (err, results) => {
        console.log(JSON.stringify(results));
        if(err) {
            console.log(err);
            return res.status(500).send(err);
        }
        else if(results.length === 0) return res.render ('empty_cart', { userObj: req.userObj })
        else return res.render('cart', { userObj: req.userObj, cartItems: JSON.stringify(results) });
    })
});

router.post('/', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj) return res.redirect('./login?action=cart');
    let data = req.body;
    if(data.protocol == 'modify') {
        connection.query("UPDATE cart_details SET quantity = ? WHERE id = ?", [data.quantity, data.cart_item_id], (err) => {
            if(err) return res.status(500).send(err);
            else return res.status(200).send('Okay');
        })
    }
    if(data.protocol == 'delete') {
        connection.query("DELETE FROM cart_details WHERE id = ?", [data.cart_item_id], (err) => {
            if(err) return res.status(500).send(err);
            else return res.status(200).send('Okay');
        })
    }
})

module.exports = router;