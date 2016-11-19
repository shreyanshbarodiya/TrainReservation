var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;

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

    if (!(req.body.p_id.constructor === Array)){
        var pid = req.body.p_id;
        req.body.p_id = [];
        req.body.p_id.push(pid);
    }

    var get_cancelled_records_query = "SELECT PNR,train_no, date_of_journey, coach_id, seat_no, coach_class " +
        "FROM ticket NATURAL JOIN travels_in NATURAL JOIN coach " +
        "WHERE pnr = :pnr AND p_id in (:p_id);";
    var shift_waitlist_query = "UPDATE travels_in SET waitlist_no=waitlist_no-:i " +
        "WHERE train_no=:train_no and " +
        "pnr in (SELECT pnr FROM ticket WHERE train_no=:train_no and date_of_journey=:doj) " +
        "and status='WL' and " +
        "coach_id in (SELECT coach_id FROM coach WHERE train_no=:train_no and coach_class=:coach_class)"
    var assign_seat_query = "UPDATE travels_in SET seat_no=:seat_no, coach_id=:coach_id, status = 'CNF', waitlist_no=0 " +
        "WHERE train_no=:train_no and " +
        "pnr in (SELECT pnr FROM ticket WHERE train_no=:train_no and date_of_journey=:doj) and " +
        "waitlist_no=:i and coach_id in (SELECT coach_id FROM coach WHERE train_no=:train_no and coach_class=:coach_class);";
    seq.query(get_cancelled_records_query, {
        replacements: {
            pnr:pnr,
            p_id:req.body.p_id
        }
    }).then( function (data) {
        console.log('Cancelled data:'+data[0]);
        var wait_clear_count = 1;
        var ticket;
        for (var i = 0; i < data[0].length; i++) {
            ticket = data[0][i];
            var doj = new Date(ticket.date_of_journey);
            doj = doj.getFullYear()+'-'+(doj.getUTCMonth()+1)+'-'+doj.getDate();
            if (ticket.seat_no != 0) {
                seq.query(assign_seat_query, {
                    replacements: {
                        train_no: ticket.train_no,
                        doj: doj,
                        i: wait_clear_count,
                        seat_no: ticket.seat_no,
                        coach_id: ticket.coach_id,
                        coach_class: ticket.coach_class
                    }
                }).then(function (affectedCount) {
                    if(affectedCount > 0)
                        wait_clear_count++;
                });
            }
        }
        return {
            train_no: ticket.train_no,
            doj: doj,
            i: wait_clear_count,
            pnr: ticket.pnr,
            coach_class: ticket.coach_class
        };
    }).then(function (params) {
        seq.query(shift_waitlist_query, {
            replacements: {
                train_no:params.train_no,
                doj:params.doj,
                i:params.i,
                coach_class:params.coach_class
            }
        });
    });

    models.Travels_in.update({status: 'CAN'}, {
        where: {pnr: pnr, p_id: {$in : req.body.p_id}}
    }).spread(function (affectedCount) {
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
                credit: txn.debit * req.body.p_id.length / parseInt(req.body.total_num),
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