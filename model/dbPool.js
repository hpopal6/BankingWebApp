// SLS01 - start
const mysql = require('mysql');
const DB_HOST = process.env['DB_HOST'];
const DB_USER = process.env['DB_USER'];
const DB_PASSWORD = process.env['DB_PASSWORD'];
const DB_DATABASE = process.env['DB_DATABASE'];
var fs = require('fs')
fs.readFile
// create the connection information for the sql database
const pool  = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ssl:{
        sslmode: 'verify-full',
        ca: fs.readFileSync('model/global-bundle.pem')
    }
});
// SLS01 - end
module.exports = pool;