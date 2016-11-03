/**
 * Created by vishal on 25/10/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

router.post('/credit', function (req, res) {
	models.User.find({where: {username: req.user.username}}).then(function (user) {
		user.balance = user.balance + parseInt(req.body.add_amt, 10);
		user.save()
			.then(function (savedUser) {
				res.json({status: 'SUCCESS', data: savedUser.balance});
			})
			.catch(function (error) {
				res.json({status: 'ERROR', data: error});
			})
	});
});

module.exports = router;