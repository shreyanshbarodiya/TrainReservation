/**
 * Created by shreyansh on 18/11/16.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('booking_form', {title: "Booking form"});
});

module.exports = router;