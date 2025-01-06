//Steps
// 1. npm init -y
// 2. npm i express ejs mysql express-session bcrypt

const express = require("express");
const pool = require("./model/dbPool"); // SLS
const app = express();

// SLS02 - start
const session = require('express-session'); // for session variables
const bcrypt = require('bcrypt');
// for bcrypt
const saltRounds = 10;

// for session variables
app.use(session ( {
  secret: process.env['SESSION_SECRET'], 
  resave: true,
  saveUninitialized: true
}));
// SLS02 - end

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// SLS04 - start
// new route
app.post("/", async function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  let hashedPwd = ""

  let sql = "SELECT * FROM Users WHERE email = ?";
  let rows = await executeSQL(sql, [username]);

  if (rows.length > 0) { // username found in database
    hashedPwd = rows[0].password;
  }

  let passwordMatch = await bcrypt.compare(password, hashedPwd);
  if (passwordMatch){
    req.session.authenticated = true;
    res.render("welcome");
  } else {
    res.render( 'index', {"loginError": true});
  }
});

// new route
app.get('/welcome', isAuthenticated, (req, res) => {
    res.render('welcome');
});

app.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/');
})
// SLS04 - end

// Route to display currency preference form
app.get('/set-preference', isAuthenticated, (req, res) => {
    res.render('setPreference');
});

// Route to display new user form
app.get('/user/new', isAuthenticated, (req, res) => {
    res.render('newUser');
});

// Route to handle new user form submission
app.post('/user/new', isAuthenticated, async (req, res) => {
    let sql = "SELECT COUNT(*) as count FROM Users WHERE email = ?";
    let params = [req.body.email];
    let rows = await executeSQL(sql, params);

    if (rows[0].count > 0) {
        res.render('newUser', { message: "Email already exists!" });
    } else {
        let hashedPwd = bcrypt.hashSync(req.body.password, saltRounds); // SLS06
        sql = "INSERT INTO Users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)";
        params = [req.body.firstName, req.body.lastName, req.body.email, hashedPwd]; // SLS06
        await executeSQL(sql, params);
        res.render('newUser', { message: "User added!" });
    }
});

// Route to list users
app.get('/users', isAuthenticated, async (req, res) => {
    let sql = "SELECT * FROM Users ORDER BY lastName";
    let rows = await executeSQL(sql);
    res.render('userList', { users: rows });
});

// Route to display edit user form
app.get('/user/edit', isAuthenticated, async (req, res) => {
    let sql = `SELECT * FROM Users WHERE userId = ?`;
    let params = [req.query.userId];
    let rows = await executeSQL(sql, params);
    res.render('editUser', { user: rows[0] });
});

// Route to handle edit user form submission
app.post('/user/edit', isAuthenticated, async (req, res) => {
    let sql1 = "SELECT COUNT(*) as count FROM Users WHERE email = ?";
    let params1= [req.body.email];
    let rows1 = await executeSQL(sql1, params1);

    if (rows1[0].count == 0) {
        // SLS 10 - start
        let password = req.body.password;
        if(password.length == 0){
            let sql0 = `UPDATE Users SET firstName = ?, lastName = ?, email = ? WHERE userId = ?`;
            let params0 = [req.body.firstName, req.body.lastName, req.body.email, req.body.userId];
            await executeSQL(sql0, params0);
        } else {
            let sql = `UPDATE Users 
                       SET firstName = ?, lastName = ?, email = ?, password = ?
                       WHERE userId = ?`;
            let hashedPwd = bcrypt.hashSync(password, saltRounds);
            let params = [req.body.firstName, req.body.lastName, req.body.email, hashedPwd, req.body.userId];
            await executeSQL(sql, params);
        }
    }
    // SLS 10 - end
    res.redirect('/users');
});

// Route to delete user
app.get('/user/delete', isAuthenticated, async (req, res) => {
    let userId = req.query.userId;

    // Delete from ConvertedTransactions
    let sql = `DELETE FROM ConvertedTransactions WHERE originalTransactionId IN (SELECT transactionId FROM Transactions WHERE userId = ?)`;
    let params = [userId];
    await executeSQL(sql, params);

    // Delete from Transactions
    sql = `DELETE FROM Transactions WHERE userId = ?`;
    await executeSQL(sql, [userId]);

    // Delete from Users
    sql = `DELETE FROM Users WHERE userId = ?`;
    await executeSQL(sql, [userId]);

    res.redirect('/users');
});

// Route to display new transaction form
app.get('/transaction/new', isAuthenticated, async (req, res) => {
    /*Harris - added transactions from sql query 
    to pass categories for dropdown input*/
    let sql = "SELECT DISTINCT category FROM Categories";
    let row = await executeSQL(sql);
    let sql2 = "SELECT * FROM Users ORDER BY lastName";
    let row2 = await executeSQL(sql2);
    //console.log(row);
    res.render('newTransaction', { categories: row, users: row2 });
});

// Route to handle new transaction form submission
app.post('/transaction/new', isAuthenticated, async (req, res) => {
    let sql = "SELECT COUNT(*) as count FROM Users WHERE userId = ?";
    let params = [req.body.userId];
    let rows = await executeSQL(sql, params);
    /*Harris - added categories from sql query 
    to pass categories for dropdown input*/
    let sql2 = "SELECT DISTINCT category FROM Categories";
    let rows2 = await executeSQL(sql2);
    let sql3 = "SELECT * FROM Users ORDER BY lastName";
    let rows3 = await executeSQL(sql3);

    if (rows[0].count === 0) {
        res.render('newTransaction', { categories: rows2, users: rows3, message: "User ID does not exist!" });
    } else {
        sql = "INSERT INTO Transactions (userId, amount, type, category, date, description, preferredCurrency) VALUES (?, ?, ?, ?, ?, ?, ?)";
        params = [req.body.userId, req.body.amount, req.body.type, req.body.category, req.body.date, req.body.description, req.body.preferredCurrency];
        await executeSQL(sql, params);
        /*Harris - added categories from sql query 
        to pass categories for dropdown input*/
        sql2 = "SELECT DISTINCT category FROM Categories";
        rows2 = await executeSQL(sql2);
        sql3 = "SELECT * FROM Users ORDER BY lastName";
        rows3 = await executeSQL(sql3);
        res.render('newTransaction', { categories: rows2, users: rows3, message: "Transaction added!" });
    }
});

// Route to display form to input user ID for transactions
app.get('/transactions', isAuthenticated, async (req, res) => {
    /*Harris - changed input from text to dropdown
    with existing users*/
    let sql = "SELECT * FROM Users ORDER BY lastName";
    let rows = await executeSQL(sql);
    res.render('transactionsByUser', { users: rows, message: null});
    //res.render('transactionsByUser', { message: null });
});

// Route to handle displaying transactions for a specific user
app.post('/transactions', isAuthenticated, async (req, res) => {
    let sql = "SELECT COUNT(*) as count FROM Users WHERE userId = ?";
    let params = [req.body.userId];
    let rows = await executeSQL(sql, params);

    if (rows[0].count === 0) {
        res.render('transactionsByUser', { message: "User ID does not exist!" });
    } else {
        let sql = `SELECT transactionId, amount, type, category, DATE_FORMAT(date, "%Y-%m-%d") as date, description, preferredCurrency, Users.firstName, Users.lastName
           FROM Transactions 
           JOIN Users ON Transactions.userId = Users.userId
           WHERE Transactions.userId = ?
           ORDER BY date DESC`;
        /*sql = `SELECT Transactions.*, Users.firstName, Users.lastName 
               FROM Transactions 
               JOIN Users ON Transactions.userId = Users.userId
               WHERE Transactions.userId = ?
               ORDER BY date DESC`;*/ //Federico's original code
        params = [req.body.userId];
        rows = await executeSQL(sql, params);

        if (rows.length === 0) {
            res.render('transactionList', { transactions: [], message: "No transactions found for this user." });
        } else {
            res.render('transactionList', { transactions: rows, message: null });
        }
    }
});

// Route to display form to input user ID for converted transactions
app.get('/converted-transactions', isAuthenticated, async (req, res) => {
    let sql = "SELECT * FROM Users ORDER BY lastName";
    let rows = await executeSQL(sql);
    res.render('convertedTransactionsByUser', {users: rows, message: null });
});

// Route to handle displaying converted transactions for a specific user
app.post('/converted-transactions', isAuthenticated, async (req, res) => {
    let sql = "SELECT COUNT(*) as count FROM Users WHERE userId = ?";
    let params = [req.body.userId];
    let rows = await executeSQL(sql, params);

    if (rows[0].count === 0) {
        res.render('convertedTransactionsByUser', { message: "User ID does not exist!" });
    } else {
        sql = `SELECT ConvertedTransactions.*, Transactions.date, Transactions.description, Transactions.type, Transactions.category, Transactions.amount AS originalAmount, Transactions.preferredCurrency, Users.firstName, Users.lastName 
               FROM ConvertedTransactions
               JOIN Transactions ON ConvertedTransactions.originalTransactionId = Transactions.transactionId
               JOIN Users ON Transactions.userId = Users.userId
               WHERE Transactions.userId = ?
               ORDER BY ConvertedTransactions.conversionDate DESC`;
        params = [req.body.userId];
        rows = await executeSQL(sql, params);

        if (rows.length === 0) {
            res.render('convertedTransactions', { convertedTransactions: [], message: "No converted transactions found for this user." });
        } else {
            res.render('convertedTransactions', { convertedTransactions: rows, message: null });
        }
    }
});

// Route to display edit transaction form
app.get('/transaction/edit', isAuthenticated, async (req, res) => {
    // let sql = `SELECT * FROM Transactions WHERE transactionId = ?`;
    // SLS - corrected formatting issue with date when passing to view
    let sql = `SELECT transactionId, userId, amount, type, category, 
               DATE_FORMAT(date, "%Y-%m-%d") as date, description, preferredCurrency 
               FROM Transactions 
               WHERE transactionId = ?`;
    let params = [req.query.transactionId];
    let rows = await executeSQL(sql, params);
    /*Harris - added categories from sql query 
    to pass categories for dropdown input WITH PREFILL*/
    let sql2 = "SELECT DISTINCT category FROM Transactions";
    let row2 = await executeSQL(sql2);
    let sql3 = "SELECT * FROM Users ORDER BY lastName";
    let row3 = await executeSQL(sql3);
    res.render('editTransaction', { transaction: rows[0], categories: row2, users: row3});
});

// Route to handle edit transaction form submission
app.post('/transaction/edit', isAuthenticated, async (req, res) => {
    let sql = `UPDATE Transactions 
               SET amount = ?, type = ?, category = ?, date = ?, description = ? 
               WHERE transactionId = ?`;
    let params = [req.body.amount, req.body.type, req.body.category, req.body.date, req.body.description, req.body.transactionId];
    await executeSQL(sql, params);
    res.redirect('/transactions');
});

// Route to delete transaction
app.get('/transaction/delete', isAuthenticated, async (req, res) => {
    let sql = `DELETE FROM ConvertedTransactions WHERE originalTransactionId = ?`;
    let params = [req.query.transactionId];
    await executeSQL(sql, params);

    sql = `DELETE FROM Transactions WHERE transactionId = ?`;
    await executeSQL(sql, [req.query.transactionId]);

    res.redirect('/transactions');
});

// Route to display convert transaction form
app.get('/transaction/convert', isAuthenticated, (req, res) => {
    res.render('convertTransaction', { transactionId: req.query.transactionId, convertedAmount: null, currencySymbol: null });
});

// Route to handle conversion
app.post('/transaction/convert', isAuthenticated, async (req, res) => {    
    const fetch = await import('node-fetch');
    let transactionId = req.body.transactionId;
    let targetCurrency = req.body.targetCurrency;

    let sql = `SELECT * FROM Transactions WHERE transactionId = ?`;
    let params = [transactionId];
    let rows = await executeSQL(sql, params);
    let transaction = rows[0];
    let response = await fetch.default(`https://v6.exchangerate-api.com/v6/e87d002144e94ca33c831b42/latest/${transaction.preferredCurrency}`);
    let data = await response.json();
    let rate = data.conversion_rates[targetCurrency];
    let convertedAmount = transaction.amount * rate;
    
    sql = `INSERT INTO ConvertedTransactions (originalTransactionId, convertedAmount, targetCurrency, conversionRate, conversionDate)
           VALUES (?, ?, ?, ?, NOW())`;
    params = [transactionId, convertedAmount, targetCurrency, rate];
    await executeSQL(sql, params);

    res.render('convertTransaction', {
        transactionId: transactionId,
        targetCurrency: targetCurrency,
        convertedAmount: convertedAmount.toFixed(2),
        currencySymbol: targetCurrency
    });
});

// Route to get financial news
app.get('/financial-news', isAuthenticated, async (req, res) => {
    const fetch = await import('node-fetch');
    let response = await fetch.default('https://newsapi.org/v2/everything?q=finance&apiKey=0c5c30e6e2b545ac98cfdc635c1edd57');
    let data = await response.json();
    res.render('financialNews', { articles: data.articles });
});

// new route
app.get("/dbTest", async function(req, res){
let sql = "SELECT CURDATE()";
let rows = await executeSQL(sql);
res.send(rows);
});//dbTest

// Functions
async function executeSQL(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, rows, fields) => {
            if (err) throw err;
            resolve(rows);
        });
    });
}

// SLS03 - start
// sessions
function isAuthenticated(req, res, next){
  if (!req.session.authenticated){
    res.redirect("/");
  } else {
    next();
  }
}// SLS03 - start

// Start server
app.listen(3000, () => {
    console.log("Express server running...");
});
