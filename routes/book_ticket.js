/**
 * Created by shreyansh on 18/11/16.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

var seq = models.sequelize;

function getSeat(trainDetails, passengerList) {
    var resultList;
    var flag = false;
    var pref_seat = {
        "Lower": [1, 4], "Middle": [2, 5], "Upper": [3, 6], "Side Upper": [0],
        "Side Lower": [7], "No Preference": [0, 1, 2, 3, 4, 5, 6, 7]
    };

    var query_coach_id = "SELECT DISTINCT coach_id,capacity FROM coach WHERE coach_class= :coachClass and train_no= :trainNo ORDER BY coach_id;";
    var coaches = new Array();
    seq.query(query_coach_id,
        {
            replacements: {
                trainNo: trainDetails.train_no,
                coachClass: trainDetails.coach_class
            }
        }).then(function (data) {
        if (!data) {
            res.statusCode(400).send('Query failed!');
        } else {
            coaches = data[0];
            //console.log(coaches);

            resultList = passengerList;

            for (var i = 0; i < passengerList.length; i++) {
                resultList[i].status = null;
                resultList[i].coach_id = coaches[0].coach_id;
                resultList[i].seat_no = 0;
                resultList[i].waitlist_no = 0;
                if (trainDetails.coach_class != 'SL' && trainDetails.coach_class != '3A') {
                    resultList[i].preference = 'No Preference';
                }
            }


            var query_allocated_seats = "WITH start_count as(select station_count as start from schedule where train_no= :trainNo and station_id= :fromStationId), " +
                "finish_count as(select station_count as finish from schedule where train_no= :trainNo and station_id= :toStationId), " +
                "traveller as( SELECT pnr,p_id,boarding_pt,destination,coach_id,seat_no,status,waitlist_no " +
                "FROM travels_in NATURAL JOIN ticket NATURAL JOIN coach " +
                "WHERE date_of_journey= :dateOfJourney and train_no = :trainNo and (status='CNF' or status='WL') and coach.coach_class = :coachClass) " +
                "select DISTINCT traveller.pnr,traveller.p_id,traveller.boarding_pt,traveller.destination,traveller.coach_id,traveller.seat_no,traveller.waitlist_no " +
                "from traveller,schedule,start_count,finish_count " +
                "where schedule.train_no = :trainNo and " +
                "((traveller.boarding_pt = schedule.station_id and schedule.station_count >= start_count.start and schedule.station_count <= finish_count.finish) " +
                "or " +
                "(traveller.destination = schedule.station_id and schedule.station_count <= finish_count.finish and schedule.station_count >= start_count.start)) " +
                "order by waitlist_no,coach_id,seat_no;";

            seq.query(query_allocated_seats,
                {
                    replacements: {
                        trainNo: trainDetails.train_no,
                        fromStationId: trainDetails.from,
                        toStationId: trainDetails.to,
                        dateOfJourney: trainDetails.journey_date,
                        coachClass: trainDetails.coach_class
                    }
                }).spread(function (data) {
                if (!data) {
                    res.statusCode(400).send('Query failed!');
                }
                else {
                    //console.log(data);
                    var freeList = new Array();
                    var j = 0;
                    for (var k = 0; k < coaches.length; k++) {
                        var coach = coaches[k];
                        if (j >= data.length) {
                            //console.log(coach);
                            for (var i = 0; i < coach.capacity; i++) {
                                freeList.push({'coach_id': coach.coach_id, 'seat_no': i + 1});
                            }

                        }
                        else if (coach.coach_id != data[j].coach_id) {
                            for (i = 0; i < coach.capacity; i++) {
                                freeList.push({'coach_id': coach.coach_id, 'seat_no': i + 1});
                            }
                        }
                        else {
                            for (i = 1; i <= coach.capacity; i++) {
                                if (j >= data.length) {
                                    //console.log(data[j]);
                                    freeList.push({'coach_id': coach.coach_id, 'seat_no': i});
                                } else {
                                    if (i != data[j].seat_no) {
                                        freeList.push({'coach_id': coach.coach_id, 'seat_no': i});
                                    } else {
                                        j++;
                                    }
                                }
                            }
                        }
                    }


                    if (data.length == 0) {
                        var waitlist_no = 1;
                    } else {
                        waitlist_no = data[data.length - 1].waitlist_no + 1;
                    }

                    for (i = 0; i < resultList.length; i++) {
                        if (freeList.length == 0) {
                            resultList[i].status = 'WL';
                            resultList[i].waitlist_no = waitlist_no;
                            resultList[i].seat_no = 0;
                            waitlist_no++;
                        }
                        for (j = 0; j < freeList.length; j++) {
                            k = freeList[j].seat_no % 8;
                            if (pref_seat[resultList[i].preference].indexOf(k) > -1) {
                                resultList[i].status = 'CNF';
                                resultList[i].waitlist_no = 0;
                                resultList[i].seat_no = freeList[j].seat_no;
                                resultList[i].coach_id = freeList[j].coach_id;
                                freeList.splice(j, 1);
                                break;
                            }
                        }
                    }
                    console.log(resultList);
                    flag = true;
                    /*return resultList;*/
                }
            })
        }
    });



    return resultList;

}

router.post('/', function (req, res) {
    var passengers = [];
    for (var i = 1; i <= 6; i++) {
        if (req.body['name' + i] === '')
            break;
        passengers.push(
            {
                p_id: Math.round(Math.random() * 100000),
                name: req.body['name' + i],
                age: req.body['age' + i],
                gender: req.body['gender' + i],
                preference: req.body['preference' + i]
            }
        )
    }
    if (passengers.length == 0) {
        req.body.err_msg = 'No passenger selected';
        res.render('booking_form', req.body);
    }
    var fare = parseFloat(req.body.fare);
    if (passengers.length * fare > req.user.balance) {
        req.body.err_msg = 'Insufficient balance in your account';
        req.body.balance = req.user.balance;
        res.render('booking_form', req.body);
    }
    var result = getSeat(req.body, passengers);

    console.log('done');
    var txn_id = Date.now();
    var pnr = Math.round(Math.random() * 10000000000);
    console.log(pnr);

    models.Transaction.create({
        txn_id: txn_id,
        username: req.user.username,
        credit: null,
        debit: fare
    }).then(function () {
        models.Ticket.create({
            PNR: pnr,
            date_of_journey: req.body.journey_date,
            boarding_pt: req.body.from,
            destination: req.body.to,
            train_no: req.body.train_no,
            username: req.user.username,
            txn_id: txn_id,
            date_of_boarding: req.body.boarding_date
        }).then(function () {
            for (var i = 0; i < result.length; i++) {
                result[i].PNR = pnr;
                result[i].train_no = req.body.train_no;
                result[i].booking_status = result[i].status;
                result[i].booking_waitlist_no = result[i].waitlist_no;
            }
            console.log(result);
            models.Passenger.bulkCreate(result, {fields: ['pnr', 'p_id', 'name', 'age', 'gender']}).then(function () {
                models.Travels_in.bulkCreate(result, {
                    fields: ['pnr', 'p_id', 'train_no', 'coach_id', 'seat_no', 'status', 'booking_status', 'waitlist_no', 'booking_waitlist_no', 'preference']
                }).then(function () {
                }).then(function () {
                    res.render('booking_confirm', {title: 'Booking Confirmation', passengers: result, req: req.body});
                });
                // passenger = result[i];
                // models.Passenger.create({
                //     PNR: pnr,
                //     p_id: passenger.p_id,
                //     name: passenger.name,
                //     age: passenger.age,
                //     gender: passenger.gender
                // })
                //     .then(function () {
                //         models.Travels_in.create({
                //             PNR: pnr,
                //             p_id: passenger.p_id,
                //             train_no: req.body.train_no,
                //             coach_id: passenger.coach_id,
                //             seat_no: passenger.seat_no,
                //             status: passenger.status,
                //             booking_status: passenger.status,
                //             waitlist_no: passenger.waitlist_no,
                //             booking_waitlist_no: passenger.waitlist_no,
                //             preference: passenger.preference
                //         });
                //     });

            });
        });
    });
});

module.exports = router;
