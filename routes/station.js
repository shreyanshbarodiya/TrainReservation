/**
 * Created by Gaurav on 25-10-2016.
 */
var express = require('express');
var router = express.Router();

var models = require('../models');

var stations = new Array();
models.Station.findAll({}).then( function (result) {
    for (var i = 0; i < result.length; i++) {
        stations.push(
            {
                'label': result[i].name + ' - ' + result[i].station_id,
                'value': result[i].station_id
            }
        );
    }
    console.log("Fetched station list");
});

/* GET station list on autocomplete */
router.get('/autocomplete', function (req, res){
    var searchKey = req.query.term.toLowerCase();
    var result = new Array();
    var i;
    for (i = 0; i < stations.length; i++) {
        if (stations[i].value.toLowerCase() == searchKey) {
            result.push(stations[i]);
        }
    }
    for (i = 0; i < stations.length; i++) {
        if (stations[i].label.toLowerCase().indexOf(searchKey) >= 0 && stations[i].value.toLowerCase() != searchKey) {
            result.push(stations[i]);
        }
    }
    res.json(result);
});

module.exports = router;