const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/index', (req, res) => {
    res.render('index');
})

router.get('/faq', (req, res) => {
    res.render('faq');
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
})

router.get('/reg_confirm', (req, res) => {
    res.render('reg_confirm');
})

router.get('/book_upload', (req, res) => {
    res.render('book_upload');
})

router.get('/book_find', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `bookupload` WHERE `fileLoc` IS NULL";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'No Books Uploaded Yet.'
        }
        res.render('book_find', { message: message, data: result });
    })
})

router.post('/book_find', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `bookupload` WHERE `fileLoc` IS NOT NULL and `genre` = '" + req.body.type + "'";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'Sorry, there are no books yet !'
        }
        res.render('book_find', { message: message, data: result });
    })
})

router.get('/book_details/:id', (req, res) => {
    var sql = "SELECT * FROM `bookupload` WHERE `id` = " + req.params.id;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('book_details', { data: result });
    })
})

router.get('/download_book', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `bookupload` WHERE `fileLoc` IS NOT NULL";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'No Books Uploaded Yet.'
        }
        res.render('book_find', { message: message, data: result });
    })
})

router.get('/buy_book', (req, res) => {
    res.render('Main_Page');
})

router.get('/buy_book/:class', (req, res) => {
    res.render(req.params.class);
})

router.get('/put_request', (req, res) => {
    res.render('put_request');
})

router.get('/find_request', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `requpload`";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'There are no new requests.'
        }
        res.render('find_request', { message: message, data: result });
    })
})

router.get('/request_details/:id', (req, res) => {
    var sql = "SELECT * FROM `requpload` WHERE `id` = " + req.params.id;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('request_details', { data: result });
    })
})

router.get('/reg_org', (req, res) => {
    res.render('reg_org');
})

router.get('/search_org', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `orgreg`";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'Sorry, there are no organisations registered yet !'
        }
        res.render('search_org', { message: message, data: result });
    })
})
router.post('/search_org', (req, res) => {
    var message = '';
    var sql = "SELECT * FROM `orgreg` WHERE `orgType` = '" + req.body.type + "'";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            message = 'Sorry, there are no organisations registered yet !'
        }
        res.render('search_org', { message: message, data: result });
    })
})

router.get('/download_book', (req, res) => {
    res.render('download_book');
})

module.exports = router;