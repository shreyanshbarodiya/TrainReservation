/**
 * Created by Ankur on 19-Oct-16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

/* GET users listing. */
router.get('/', function (req, res){
    res.render('PNR', {title: "PNR Enquiry"});
});

module.exports = router;
