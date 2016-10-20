/**
 * Created by vishal on 10/19/16.
 */
var express = require('express');
var passport = require('passport');
var router = express.Router();

router.post('/', passport.authenticate('local-signup',
	{ failureRedirect: '/signup',
		successRedirect: '/',
		failureFlash: true
	}
));

router.get('/', function(req, res) {
	if (req.isAuthenticated())
		res.redirect('/');

	res.render('signup', {title: "Signup", signuperrmsg: req.flash('error')});
});

module.exports = router;