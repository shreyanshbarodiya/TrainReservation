/**
 * Created by Gaurav on 26-10-2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');
var seq = models.sequelize;

var classFare = {
    '1A':[10,5,2],
    '2A':[7.5,3,1.5],
    '3A':[5,1.5,0.8],
    'SL':[4,1,0.4],
    'CC':[4.5,1.5,0.7],
    '2S':[3,1,0.3]
};

function getFare(distance, coach_class) {
    var fareRate = classFare[coach_class];
    if(distance < 50)
        return fareRate[0]*distance;
    else if(distance < 150)
        return fareRate[0]*50 + fareRate[1]*(distance-50);
    else
        return fareRate[0]*50 + fareRate[1]*100 + fareRate[2]*(distance-150);
}

/* GET users listing. */
router.get('/', function (req, res){
    res.render('search_trains', {title: "Search Trains"});
});

var dayOfWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

router.post('/',function(req,res){
    var src = req.body.search_from;
    var dest = req.body.search_to;
    var dob = new Date(req.body.search_date);

    var query = "WITH search_result AS (SELECT DISTINCT S1.train_no,name,S1.departure_time,S2.arrival_time, " +
        "coach_class, S1.days " +
        "FROM schedule AS S1, schedule AS S2 NATURAL JOIN train NATURAL JOIN runs_on " +
        "NATURAL JOIN coach " +
        "WHERE S2.train_no = S1.train_no AND S2.station_count > S1.station_count AND " +
        "runs_on.day_of_week = mod(:dow - 1 + S1.days, 7) " +
        "AND S1.station_id = :source AND S2.station_id = :destination " +
        "ORDER BY train_no, coach_class)" +
        "SELECT * FROM search_result NATURAL JOIN runs_on;";

    seq.query(query,
        {
            replacements: {
                dow: dob.getDay(),
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
                var day_of_week = new Array();
                coach_class.push(train.coach_class);
                day_of_week.push(dayOfWeek[train.day_of_week]);
                while(true) {
                    if (++i >= search_results.length || search_results[i].coach_class != train.coach_class) {
                        break;
                    }
                    day_of_week.push(dayOfWeek[search_results[i].day_of_week]);
                }
                while(true){
                    if(i >= search_results.length || search_results[i].train_no != train.train_no){
                        break;
                    }
                    coach_class.push(search_results[i].coach_class);
                    i = i+day_of_week.length;
                }
                train.coach_class = coach_class;
                train.day_of_week = day_of_week;
                var doj = new Date(req.body.search_date);
                doj.setDate(doj.getDate() - (train.days - 1));
                console.log(doj);
                train.doj = doj.getFullYear()+'-'+(doj.getUTCMonth()+1)+'-'+doj.getDate();
                trains.push(train);
            }
            res.render('search_train_result_date',{title:"Search Trains", search_result:trains, balance:req.user.balance, search_from:src, search_to: dest, search_date: req.body.search_date});
        }
    });


});

router.post('/availability', function (req, res) {
    var postData = req.body;
    var query = "WITH traveller as (SELECT pnr,p_id,boarding_pt,destination " +
                                    "FROM travels_in NATURAL JOIN  ticket NATURAL JOIN coach " +
                                    "WHERE date_of_journey= :date and train_no = :train_no and (status='CNF' or status='WL') and coach.coach_class = :coach_class)," +
                        "total_capacity as (select sum(capacity) as total_seat from coach where train_no = :train_no and coach_class = :coach_class)," +
                        "start_count as (select station_count as start from schedule where train_no=:train_no and station_id = :from)," +
                        "finish_count as(select station_count as finish from schedule where train_no=:train_no and station_id= :to)," +
                        "traveller_count as(select count(p_id) as total_ticket from traveller)," +
                        "noobj_traveller as(select count(p_id) as noobj_ticket " +
                                            "from traveller,schedule,start_count,finish_count " +
                                            "where schedule.train_no = :train_no and ((traveller.boarding_pt = schedule.station_id and schedule.station_count > finish_count.finish) " +
                                            "OR (traveller.destination = schedule.station_id and schedule.station_count<start_count.start))) " +
                "select station_id, distance, (select (total_capacity.total_seat - traveller_count.total_ticket + noobj_traveller.noobj_ticket) " +
                    "from total_capacity, traveller_count, noobj_traveller) as availability " +
                "from schedule where train_no=:train_no;";

    seq.query(query,
        {
            replacements: postData
        }).then(function (data) {
        if(!data) {
            res.statusCode(400).send('Query failed!');
        }
        else {
            var result = data[0];
            var distance = 0;
            var availability = data[0][0].availability;
            for(var i=0; i< data[0].length; i++) {
                station = data[0][i];
                if (station.station_id == postData.to)
                    distance += station.distance;
                else if (station.station_id == postData.from)
                    distance -= station.distance;
            }
            if(parseInt(availability)>0)
                availability = 'Available ' + availability;
            else {
                availability = 'WL' + parseInt(availability)*-1;
            }
            var response = {availability: availability, fare: getFare(distance, postData.coach_class).toFixed(2)};
            res.send(response);
        }
    })
})

module.exports = router;