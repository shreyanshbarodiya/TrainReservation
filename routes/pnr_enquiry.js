/**
 * Created by Vishal on 11/19/2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function (req, res) {
    res.render('PNR', {title: "PNR Enquiry"});
});

module.exports = router;