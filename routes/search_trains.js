/**
 * Created by Gaurav on 26-10-2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;


/* GET users listing. */
router.get('/', function (req, res){
    res.render('search_trains', {title: "Search Trains"});
});

router.post('/',function(req,res){
    var src = req.body.search_from;
    var dest = req.body.search_to;
    var doj = new Date(req.body.search_date);

    var query = "SELECT DISTINCT " +
        "S1.train_no, " +
        "name," +
        "S1.departure_time, " +
        "S2.arrival_time, " +
        "coach_class " +
        "FROM schedule AS S1, schedule AS S2 NATURAL JOIN train NATURAL JOIN runs_on " +
        "NATURAL JOIN coach " +
        "WHERE S2.train_no = S1.train_no AND S2.station_count > S1.station_count AND " +
        "runs_on.day_of_week = mod(:dow - 1 + S1.days, 7) " +
        "AND S1.station_id = :source AND S2.station_id = :destination " +
        "ORDER BY train_no;";

    seq.query(query,
        {
            replacements: {
                dow: doj.getDay(),
                source: src,
                destination: dest
            }
        }).spread(function (data,metadata) {
        if (!data) {
            status = "ERROR";
        }
        else {
            status = "OK";
            search_results = data;
            var trains = new Array();

            for(var i=0; i<search_results.length ; ){
                var train = search_results[i];
                var coach_class = new Array();
                coach_class.push(train.coach_class);

                while(true){
                    if(++i >= search_results.length || search_results[i].train_no != train.train_no){
                        break;
                    }
                    coach_class.push(search_results[i].coach_class);
                }
                train.coach_class = coach_class;
                trains.push(train);
            }
            res.render('search_train_result_date',{title:"Search Trains", search_result:trains, balance:req.user.balance, search_from:src, search_to: dest, search_date: req.body.search_date});
        }
    });


});

router.post('/availability', function (req, res) {
    //TODO Add query for getting availability
    var postData = req.body;
    var query = "WITH traveller as (SELECT pnr,p_id,boarding_pt,destination " +
                                    "FROM travels_in NATURAL JOIN  ticket NATURAL JOIN coach " +
                                    "WHERE date_of_journey= :doj and train_no = :train_no and (status='CNF' or status='WL') and coach.coach_class = :coach_class)," +
                        "start_count as (select station_count as start from schedule where train_no=:train_no and station_id = :from)," +
                        "finish_count as(select station_count as finish from schedule where train_no=:train_no and station_id= :to)," +
                        "traveller_count as(select count(p_id) as total_ticket from traveller)," +
                        "noobj_traveller as(select count(p_id) as noobj_ticket " +
                                            "from traveller,schedule,start_count,finish_count " +
                                            "where schedule.train_no = :train_no and ((traveller.boarding_pt = schedule.station_id and schedule.station_count > finish_count.finish) " +
                                            "OR (traveller.destination = schedule.station_id and schedule.station_count<start_count.start)) " +
                "select (traveller_count.total_ticket-noobj_traveller.noobj_ticket) as conflicts " +
        "from traveller_count, noobj_traveller; ";

    seq.query(query,
        {
            replacements: postData
        }).then(function (data) {
        console.log(data);
        var data = {availability:req.body.coach_class, fare: 500};
        res.send(data);
    })
})

module.exports = router;