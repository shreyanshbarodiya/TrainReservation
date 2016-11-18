var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function (req, res) {
    models.Ticket.findAll({
        where: {username: req.user.username}
    }).then(function (tickets) {
        res.render('booked_ticket_history', {title: 'Booked Ticket History', tickets: tickets, balance: req.user.balance});
    }).catch(function (err) {
        res.render('index', {title: 'Home', error: err.message, balance: req.user.balance});
    })
});

module.exports = router;