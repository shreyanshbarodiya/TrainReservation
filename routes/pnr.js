/**
 * Created by Ankur on 19-Oct-16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;

router.get('/', function (req, res) {
    res.render('PNR', {title: "PNR Enquiry"});
});

router.post('/', function (req, res) {
    var pnr_number = req.body.pnr;
    var pnr_data;
    var passenger_data;
    var status;
    var query_common = 'WITH pnr_data_1 AS (SELECT ' +
        'pnr,' +
        'train_no,' +
        'date_of_journey,' +
        'boarding_pt,' +
        'destination ' +
        'FROM ticket ' +
        'WHERE pnr = :pnr),' +
        'pnr_data_2 AS (SELECT ' +
        'pnr,' +
        'train_no,' +
        'name,' +
        'date_of_journey,' +
        'boarding_pt,' +
        'destination ' +
        'FROM pnr_data_1 ' +
        'NATURAL JOIN train) ' +
        'SELECT DISTINCT ' +
        'pnr_data_2.pnr,' +
        'pnr_data_2.train_no,' +
        'pnr_data_2.name,' +
        'coach.coach_class,' +
        'pnr_data_2.date_of_journey,' +
        'pnr_data_2.boarding_pt,' +
        'pnr_data_2.destination ' +
        'FROM pnr_data_2, travels_in, coach ' +
        'WHERE pnr_data_2.train_no = travels_in.train_no AND travels_in.coach_id = coach.coach_id;';

    var query_passenger = "with pnr_status_1 as (select pnr,p_id,preference,status,coach_id,seat_no,waitlist_no from travels_in where pnr=:pnr)" +
        " select p_id, name,age,gender,preference,status,coach_id,seat_no,waitlist_no " +
        "from pnr_status_1 natural join passenger;";

    seq.query(query_common,
        {
            replacements: {
                pnr: pnr_number
            }
        }).spread(function (data,meadata) {
        if (!data) {
            status = "ERROR"
        }
        else {
            pnr_data = data;
        }

        seq.query(query_passenger,
            {
                replacements: {
                    pnr: pnr_number
                }
            }).spread(function (data,metadata) {
            if (!data) {
                status = "ERROR";
            }
            else {
                status = "OK";
                passenger_data = data;
            }

//            console.log(pnr_data);
            console.log(req.body.cancel);
            //if(status=="OK"){
            res.render('pnr_result',
                {
                    title: "PNR Status",
                    pnr_data: pnr_data,
                    passenger_data: passenger_data,
                    cancel : req.body.cancel
                });
            //}else{
            //res.render('pnr',{title:"PNR Enquiry", status:status});
            //}
        });
    });

});

module.exports = router;
