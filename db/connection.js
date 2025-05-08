const mysql = require('mysql2');

const connection = mysql.createConnection({
    user: 'baodang',
    port: 100,
    password: 'Go050398551245!',
    database: 'pepicase'
});

// Connect to the database
connection.connect(err => {
    if (err) { console.error('Error connecting to MySQL:', err); return; }
    else console.log('Connected to MySQL.')
});

module.exports = connection;