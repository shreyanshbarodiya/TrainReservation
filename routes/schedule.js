/**
 * Created by Gaurav on 15-11-2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;

router.get('/:train_no', function (req, res) {
    var train_no = req.params.train_no;
    models.Schedule.findAll(
        {
            where: { train_no: train_no},
            order: ['station_count']
        }
    ).then(function(schedules) {
        schedules[0].arrival_time = 'Source';
        schedules[schedules.length - 1].departure_time = 'Destination';
        res.render('schedule', {title: "Schedule for Train no "+train_no, schedules:schedules});
    });
});

module.exports = router;