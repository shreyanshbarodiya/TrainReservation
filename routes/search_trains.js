/**
 * Created by Gaurav on 26-10-2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

/* GET users listing. */
router.get('/', function (req, res){
    res.render('search_trains', {title: "Search Trains"});
});

module.exports = router;