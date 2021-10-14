require('dotenv').config()
const express = require("express")
const app = express()
const path = require('path')
    //EXTRAA
var fileUpload = require('express-fileupload')
    //EXTRAA
const passport = require('passport')
const cookieSession = require('cookie-session')
require('./passport-setup')

const mysql = require("mysql")
const { read } = require("fs")

app.set('view engine', 'ejs')

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//EXTRAA
app.use(fileUpload());
//EXTRAA


const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}));


//-----------------------------------------------


//DataBase

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
/*
db.connect( (error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
} );
*/
if (!db._connectCalled) {
    db.connect((error) => {
        if (error) {
            console.log(error)
        } else {
            console.log("MYSQL Connected...")
        }
    });
}

global.db = db;


//--------------------------------------------------



//All for GOOGLE:

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

const { createConnection } = require("net")





// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
};

//GOOGLE Routes


app.get('/failed', (req, res) => res.send('You Failed to log in!'))

app.get('/success', (req, res) => {
    console.log('email ----');
    console.log(req.user.emails[0].value);
    var email = req.user.emails[0].value;
    var sql = 'SELECT * FROM `registration` WHERE `email` = "' + email + '"';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result.length);
        if (result.length == 0) {
            res.render("profile", { name: req.user.displayName, pic: req.user.photos[0].value, email: req.user.emails[0].value });
        } else if (result.length != 0) {
            res.render("dashboard");
        }
    })
})

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/success');
    }
)

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})



//--------------------------------------



app.post('/submit', function(req, res) {
    console.log(req.body);

    var sql = "insert into registration values (null, '" + req.body.name + "', '" + req.body.email + "')";
    db.query(sql, function(err) {

        if (err) throw err
            //SQL 
        res.render("reg_confirm");
    });
});


app.get('/book1', (req, res) => { res.render('Textbooks') })

var Razorpay = require("razorpay");

let instance = new Razorpay({
    key_id: your_key_id, // your `KEY_ID`
    key_secret: your_key_secret // your `KEY_SECRET`
})

app.post("/api/payment/order", (req, res) => {
    params = req.body;
    instance.orders.create(params).then((data) => {
        res.send({ "sub": data, "status": "success" });
    }).catch((error) => {
        res.send({ "sub": error, "status": "failed" });
    })
});

app.post("/api/payment/verify", (req, res) => {
    body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', 'rOq8CdL3p8h8ICmtljehLP99')
        .update(body.toString())
        .digest('hex');
    console.log("sig" + req.body.razorpay_signature);
    console.log("sig" + expectedSignature);
    var response = { "status": "failure" }
    if (expectedSignature === req.body.razorpay_signature)
        response = { "status": "success" }
    res.send(response);
});


app.post('/uploadbook', function(req, res) {
    console.log(req.body);
    console.log(req.files);
    if (req.files) {
        book = req.files.bookPDF;
        book.mv('public/uploads/' + book.name);
        var type = 'soft';
    } else {
        var type = 'hard';
    }
    if (type == ' soft') {
        var sql = "insert into bookupload values (null, '" + req.body.firstname + "', '" + req.body.lastname + "', null, null, null, null, '" + req.body.email + "', '" + req.body.contact + "', '" + req.body.bookname + "', '" + req.body.genre + "', '" + req.body.year + "', '" + req.body.description + "', '" + book.name + "')";
    } else {
        var sql = "insert into bookupload values (null, '" + req.body.firstname + "', '" + req.body.lastname + "', '" + req.body.address + "', '" + req.body.city + "', '" + req.body.state + "', '" + req.body.zip + "', '" + req.body.email + "', '" + req.body.contact + "', '" + req.body.bookname + "', '" + req.body.genre + "', '" + req.body.year + "', '" + req.body.description + "', null)";
    }
    db.query(sql, function(err) {

        if (err) throw err
            //SQL 
        res.render("dashboard");
    });
});

const nodemailer = require('nodemailer');
const cron = require('node-schedule');

app.post('/uploadrequest', function(req, res) {
    console.log(req.body);
    console.log(req.files);
    bookT = req.files.bookCover;
    bookT.mv('public/images/book-thumbnails/' + bookT.name);
    var sql = "insert into requpload values (null, '" + req.body.firstname + "', '" + req.body.lastname + "', '" + req.body.address + "', '" + req.body.city + "', '" + req.body.state + "', '" + req.body.zip + "', '" + req.body.email + "', '" + req.body.contact + "', '" + req.body.bookname + "', '" + req.body.genre + "', '" + req.body.year + "', '" + req.body.description + "', '" + bookT.name + "')";
    db.query(sql, function(err) {

        if (err) throw err
            //SQL 

        var sql2 = "select * from registration";
        db.query(sql2, (err, result2) => {
            if (err) throw err;
            var trans = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: from_email,
                    pass: from_email_password
                }
            });

            var text = 'New Request';

            const mailOpt = {
                from: from_email,
                to: to_email,
                subject: 'New Book Request',
                text: text,
                html: '<b>New Request</b><br><br>Hey Vedangi, check out our website, there is a new book request.<br><br>Requested By: ' + req.body.firstname + ' ' + req.body.lastname + '<br>Book: ' + req.body.bookname + '<br>Book Genre: ' + req.body.genre + '<br><br>Click on this link to view the contact details and more --> http://localhost:8002'
            };

            trans.sendMail(mailOpt, function(error, info) {
                console.log('ok');
                if (error) throw error;
                console.log('message sent: ' + info.response);
                res.render("dashboard");
            });


        })

    });
});

app.post('/regorg', function(req, res) {
    console.log(req.body);

    var sql = "insert into orgreg values (null, '" + req.body.orgname + "', '" + req.body.orgtype + "', '" + req.body.address + "', '" + req.body.city + "', '" + req.body.state + "', '" + req.body.zip + "', '" + req.body.email + "', '" + req.body.contact + "', '" + req.body.childno + "', '" + req.body.age + "', '" + req.body.description + "')";
    db.query(sql, function(err) {

        if (err) throw err
            //SQL 
        res.render("dashboard");
    });
});

//--------------------------------

// Defining Routes:
app.use('/', require('./routes/pages'));

//--------------------------------

//Port:
app.listen(8002, () => {
    console.log("Server started on Port 8002");
});

//--------------------------------