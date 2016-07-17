'use strict'
var request = require('request');
var _ = require('lodash');
var async = require('async');
var moment = require('moment-timezone');

var baseURL = 'http://node.locomote.com/code-task/';

module.exports = function () {

    return {
        getFlightSearchResults: function (req, res) {

            //In this section I get all the query parameters from de front-end
            var from = req.query.from.split(',');
            var to = req.query.to.split(',');
            var _date = req.query.date;
            var startDate = new moment(_date, 'YYYY-MM-DD').add(-2, 'days');

            var dates = [];
            
            //I build an collection with nearby dates (+/- 2):
            for (var i = 0; i < 5; i++) {
                dates.push({ date: new moment(startDate, 'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD') });
            }

            var from_city = from[0].trim();
            var from_country = from[1].trim();

            var to_city = to[0].trim();
            var to_country = to[1].trim();
            //-------------------------------------
            //In this request I get all the airlines 
            request(baseURL + 'airlines', function (err, response) {
                var _airlines = JSON.parse(response.body);
                //In this map I do a request 
                async.map([(baseURL + 'airports?q=' + from_city),
                    (baseURL + 'airports?q=' + to_city)], function (url, callback) {
                        console.log(url);
                        request(url, function (err, response) {
                            if (!err) {
                                
                                callback(null, JSON.parse(response.body));
                            }
                        });

                    }, function (err, results) {

                        if (!err) {
                        
                            var airport_from = _.find(results[0], function (item) {
                                return item.countryName == from_country
                            });

                            var airport_to = _.find(results[1], function (item) {
                                return item.countryName == to_country
                            });
                            
                            async.map(dates, function (dateItem, callback) {

                                async.map(_airlines, function (airline, callback) {
                                    var _urlFinalRequest = (baseURL + 'flight_search/' + airline.code + '?date=' + dateItem.date + '&from=' + airport_from.airportCode + '&to=' + airport_to.airportCode);
                                 
                                    request(_urlFinalRequest, (err, response) => {
                                        if (!err && response.body != 'date can\'t be past') {

                                            var parsedflights = JSON.parse(response.body);
                                            var cheaperFlight = _.minBy(parsedflights, function (o) {
                                               
                                                return o.price;
                                            }); 
                                           
                                            callback(null, cheaperFlight);
                                        } else {
                                            callback(null, null);
                                        }

                                    });
                                }, function (err, _flights) {
                                    if (!err && _flights) {
                                        
                                        var datingFlights = _.filter(_flights, function (o) {
                                            var matched = new moment(o.start.dateTime).tz(o.start.timeZone).format('YYYY-MM-DD') === dateItem.date;
                                           
                                            return matched;
                                        }); 
                                        callback(null, {date:dateItem.date, flights:datingFlights});

                                    }

                                });

                            }, function (err, flightResults) {
                                res.send(flightResults);
                            });
                        }
                    })

            });
        }
    }
}