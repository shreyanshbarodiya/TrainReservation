var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {title: "Home", name: req.flash('name')});
});

module.exports = router;