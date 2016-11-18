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
    var pnr = parseInt(req.body.pnr, 10);
    models.Travels_in.update({status: 'CAN'}, {where: {pnr: pnr, p_id: req.body.p_id}})
        .spread(function (affectedCount) {
            models.Ticket.findByPrimary(pnr).then(function (ticket) {
                models.Transaction.findByPrimary(ticket.txn_id).then(function (txn) {
                    models.Transaction.create({
                        txn_id: Date.now(),
                        username: req.user.username,
                        credit: txn.debit,
                        debit: null
                    });
                    models.User.update({balance: req.user.balance + parseInt(txn.debit)}, {where: {username: req.user.username}})
                        .then(function () {
                            res.json({status: 'SUCCESS', data: affectedCount});
                            req.login(user, function (error) {
                                if (!error) {
                                    console.log('successfully updated user');
                                }
                            });
                            res.end();
                        })
                        .catch(function (err) {
                            res.json({status: 'ERROR', data: err.message});
                        });
                })
            }).catch(function (err) {
                res.json({status: 'ERROR', data: err.message});
            })
        });
});

module.exports = router;