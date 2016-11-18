/**
 * Created by shreyansh on 18/11/16.
 */

var express = require('express');
var router = express.Router();

router.get('/:train_no/:coach_class/:from/:to/:journeydate/:boardingdate', function (req, res) {
    var train_no = req.params.train_no;
    var coach_class = req.params.coach_class;
    var from = req.params.from;
    var to = req.params.to;
    var journey_date = req.params.journeydate;
    var boarding_date = req.params.boardingdate;

    res.render('booking_form',
        {
            title: "Book Ticket",
            train_no: train_no,
            coach_class: coach_class,
            from : from,
            to : to,
            journey_date : journey_date,
            boarding_date : boarding_date
        });
});
module.exports = router;