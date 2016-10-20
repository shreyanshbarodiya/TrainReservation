/**
 * Created by vishal on 10/19/16.
 */
var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function (req, res) {
	if (req.isAuthenticated())
		res.redirect('/');

	res.render('login', {title: "Login", loginerrmsg: req.flash('error')});
});

router.post('/', passport.authenticate('local-login',
	{
		failureRedirect: '/login',
		successRedirect: '/',
		failureFlash: true
	}
));

module.exports = router;