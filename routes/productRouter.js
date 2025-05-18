var express = require('express');
var router = express.Router();
const connection = require('../db/connection');

var authMiddleware = require('../middleware/authMiddleware')

router.get('/', authMiddleware.tokenInit, function(req, res) {
    connection.query('SELECT * FROM product', (err, results) => {
        if(err) res.status(500).send(err);
        else return res.render('catalog', { userObj: req.userObj, productArr: results });
    })
});

router.get('/:id', authMiddleware.tokenInit, function(req, res) {
    connection.query('SELECT * FROM product WHERE id = ?', req.params.id.toString(), (err, results) => {
        if(err) res.status(500).send(err);
        else if(results.length === 0) res.status(401).send('Product not found!');
        else return res.status(200).render('product', { userObj: req.userObj, product: results[0] });
    })
});

function isValidPayload(obj) {
  const patterns = {
    product_id: /^\d+$/,
    user_id: /^\d+$/,
    size: /^iPhone\s?\d{2}$/,
    quantity: /^[1-9]\d*$/,
    name: /^.{1,255}$/,
    price: /^\d+(\.\d{1,2})?$/,
  };
  return Object.entries(patterns).every(([key, regex]) => 
    regex.test(obj[key])
  );
}

router.post('/add-to-cart', authMiddleware.tokenInit, function(req, res) {
    if(!req.userObj && req.body.product_id) return res.redirect(`../login?action=product/` + req.body.product_id);
    let data = req.body;
    if (isValidPayload(data)) {
        connection.query('SELECT * FROM cart WHERE user_id = ?', [req.userObj.id], (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length === 0) connection.query('INSERT INTO cart (user_id, total_amount, total_price) VALUES (?, 0, 0)', [req.userObj.id], (err, insertResult) => {
                if (err) return res.status(500).send(err);
                proceed(insertResult.insertId);
            });
            else proceed(results[0].id);
        });
    }
    else return res.status(500).send('Lmao');

    const proceed = (cart_id) => {
        connection.query('SELECT * FROM cart_details INNER JOIN cart ON cart_details.cart_id = cart.id WHERE user_id = ? AND product_id = ? and size = ?', 
          [req.userObj.id, data.product_id, data.size], (err, results) => {
            if(err) return res.status(500).send(err);
            else if(results.length === 0) {
                connection.query("INSERT INTO cart_details (cart_id, product_id, name, size, quantity, price) VALUES (?, ?, ?, ?, ?, ?)", 
                  [cart_id, data.product_id, data.name, data.size, data.quantity, data.price], (err) => {
                    if(err) return res.status(500).send(err);
                    else res.status(200).send('Product added to cart successfully!');
                });
            }
            else {
                let currQuantity = results[0].quantity;
                currQuantity += data.quantity;
                connection.query("UPDATE cart_details SET quantity = ? WHERE cart_id = ? AND product_id = ? AND size = ?",
                  [currQuantity, cart_id, data.product_id, data.size], (err) => {
                    if(err) return res.status(500).send(err);
                    else res.status(200).send('Updated cart successfully');
                })
            }
        })
    }
});

module.exports = router;