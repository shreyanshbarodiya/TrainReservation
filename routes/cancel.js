var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function (req, res) {
    models.Ticket.findAll({
        where: {username: req.user.username}
    }).then(function (tickets) {
        res.render('booked_ticket_history', {title: 'Booked Ticket History', tickets: tickets, cancelFlag: true, balance:req.user.balance});
    }).catch(function (err) {
        res.render('index', {title: "Home", name: req.user.name, balance: req.user.balance, error: err.message});
    })
});

router.post('/', function (req, res) {
    models.Travels_in.update({status: 'CAN'}, {where: {pnr: parseInt(req.body.pnr, 10), p_id: req.body.p_id}})
        .spread(function (affectedCount, affectedRows) {
            res.json({status: 'SUCCESS', data: affectedCount});
        })
        .catch(function (err) {
            res.json({status: 'ERROR', data: err});
        })
});

module.exports = router;