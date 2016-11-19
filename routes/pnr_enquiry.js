/**
 * Created by Vishal on 11/19/2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

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
        'date_of_boarding,' +
        'boarding_pt,' +
        'destination ' +
        'FROM ticket ' +
        'WHERE pnr = :pnr),' +
        'pnr_data_2 AS (SELECT ' +
        'pnr,' +
        'train_no,' +
        'name,' +
        'date_of_boarding,' +
        'boarding_pt,' +
        'destination ' +
        'FROM pnr_data_1 ' +
        'NATURAL JOIN train) ' +
        'SELECT DISTINCT ' +
        'pnr_data_2.pnr,' +
        'pnr_data_2.train_no,' +
        'pnr_data_2.name,' +
        'coach.coach_class,' +
        'pnr_data_2.date_of_boarding,' +
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
        })
        .spread(function (data) {
        if (!data || data.length == 0) {
            status = "ERROR"
        }
        else {
            pnr_data = data;

            return seq.query(query_passenger,
                {
                    replacements: {
                        pnr: pnr_number
                    }
                }).spread(function (data, metadata) {
                if (!data || data.length == 0) {
                    status = "ERROR";
                    res.render('PNR', {
                        title: "PNR Enquiry",
                        status: status
                    });
                }
                else {
                    passenger_data = data;
                    res.render('pnr_result',
                        {
                            title: "PNR Status",
                            pnr_data: pnr_data,
                            passenger_data: passenger_data
                        });
                }

            }).catch(function (err) {
                handleError(req, res, err.message);
            });
        }

        if (status == 'ERROR') {
            handleError(req, res, 'No PNR data found');
        }

    }).catch(function (err) {
        handleError(req, res, err.message);
    });
});

function handleError(req, res, message) {
    res.render('PNR', {title: 'PNR Enquiry', status: message});
}

module.exports = router;