var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function (req, res) {
    models.Ticket.findAll({
        where: {username: req.user.username}
    }).then(function (tickets) {
        res.render('booked_ticket_history', {title: 'Booked Ticket History', tickets: tickets, cancelFlag: true});
    }).catch(function (err) {
        res.render('index', {title: 'Home', error: err.message});
    })
});

router.post('/', function (req, res) {
    models.Travels_in.update({status: 'CAN'}, {where: {pnr: req.body.pnr, pid: req.body.p_id}});
});

module.exports = router;