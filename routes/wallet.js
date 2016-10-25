/**
 * Created by vishal on 25/10/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

router.post('/credit', function (req, res) {
	models.User.find({where: {username: req.flash('id')}}).then(function(user){
		user.balance = user.balance + req.body.add_amt;
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