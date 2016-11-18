/**
 * Created by vishal on 25/10/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

router.post('/credit', function (req, res) {
    models.User.find({where: {username: req.user.username}}).then(function (user) {
        var credit = parseInt(req.body.add_amt, 10);
        user.balance = user.balance + credit;
        user.save()
            .then(function (savedUser) {
                res.json({status: 'SUCCESS', data: savedUser.balance});
                models.Transaction.create({
                    txn_id: Date.now(),
                    username: req.user.username,
                    credit: credit,
                    debit: null
                }).then(function (transaction) {
                    req.login(user, function (error) {
                        if (!error) {
                            console.log('successfully updated user');
                        }
                    });
                }).catch(function (error) {
                    res.json({status: 'ERROR', data: error});
                });

                res.end();
            })
            .catch(function (error) {
                res.json({status: 'ERROR', data: error});
            })
    }).catch(function (error) {
        res.json({status: 'ERROR', data: error});
    });
});

module.exports = router;