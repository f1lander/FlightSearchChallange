

var express = require('express');
var router = express.Router();
var flight_controller = require('../controllers/flight')();

router.get('/',flight_controller.getFlightSearchResults);

module.exports = router;
