/**
 * Created by shreyansh on 18/11/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;

router.post('/', function (req, res) {
    var passengers = new Array();
    for(var i=1; i<=6; i++) {
        if(req.body['name'+i] === '')
            break;
        passengers.push(
            {
                name:req.body['name'+i],
                age:req.body['age'+i],
                gender:req.body['gender'+i],
                preference:req.body['preference'+i],
            }
        )
    }
    if(passengers.length == 0) {
        req.body.err_msg = 'No passenger selected';
        res.render('booking_form', req.body);
    }
    var fare = parseFloat(req.body.fare);
    if(passengers.length * fare > req.user.balance) {
        req.body.err_msg = 'Insufficient balance in your account';
        res.render('booking_form', req.body);
    }
    var result = getSeat(req.body, passengers);
    res.send(result);
});

module.exports = router;
