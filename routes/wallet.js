/**
 * Created by vishal on 25/10/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

router.post('/credit', function (req, res) {
    var credit = parseInt(req.body.add_amt, 10);
    var user = req.user;
    var status, data;
    user.balance = user.balance + credit;
    models.User.update({balance: user.balance}, {where: {username: req.user.username}})
        .then(function () {
            return models.Transaction.create({
                txn_id: Date.now(),
                username: req.user.username,
                credit: credit,
                debit: null
            })
        })
        .then(function () {
            req.login(user, function (error) {
                if (error) {
                    status = 'ERROR';
                    data = error;
                }
                else{
                    status = 'SUCCESS';
                    data = user.balance;
                }
            });
            res.json({status: status, data: data});
            res.end();
        })
        .catch(function (error) {
            res.json({status: 'ERROR', data: error});
        });

});

module.exports = router;