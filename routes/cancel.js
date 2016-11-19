var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function (req, res) {
    models.Ticket.findAll({
        where: {username: req.user.username}
    })
        .then(function (tickets) {
            res.render('booked_ticket_history', {
                title: 'Booked Ticket History',
                tickets: tickets,
                cancelFlag: true,
                balance: req.user.balance
            });
        })
        .catch(function (err) {
            res.render('index', {title: "Home", name: req.user.name, balance: req.user.balance, error: err.message});
        })
});

router.post('/', function (req, res) {
    var user = req.user;
    var pnr = parseInt(req.body.pnr, 10);
    var numCancelled, status, data;

    models.Travels_in.update({status: 'CAN'}, {
        where: {pnr: pnr, p_id: req.body.p_id}
    })
        .spread(function (affectedCount) {
            numCancelled = affectedCount;
            return models.Ticket.findByPrimary(pnr)
        })
        .then(function (ticket) {
            return models.Transaction.findByPrimary(ticket.txn_id)
        })
        .then(function (txn) {
            return models.Transaction.create({
                txn_id: Date.now(),
                username: req.user.username,
                credit: txn.debit * req.body.p_id.length / req.body.total_num,
                debit: null
            })
        })
        .then(function (credit_txn) {
            user.balance = user.balance + parseInt(credit_txn.credit);
            return models.User.update({balance: user.balance}, {where: {username: req.user.username}})
        })
        .then(function () {
            req.login(user, function (error) {
                if (error) {
                    status = 'ERROR';
                    data = error;
                }
                else {
                    status = 'SUCCESS';
                    data = numCancelled;
                }
            });
            res.json({status: status, data: data});
            res.end();
        })
        .catch(function (err) {
            res.json({status: 'ERROR', data: err.message});
        });

});

module.exports = router;