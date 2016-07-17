 $('#loader').hide();

$("#form1").submit(function (event) {

    var _from = $('#fly-from').val();
    var _to = $('#fly-to').val();
    var _date = $('#fly-date').val();

    console.log(_from, _to, _date);
    $('#loader').show();
    var request = $.ajax({
        url: "/flight",
        method: "GET",
        data: { from: _from, to: _to, date: _date },
        dataType: "json"
    });

    request.done(function (results) {
        for (var i = 0; i < results.length; i++) {
            console.log('#tab' + (i + 1));
            $('#tab' + (i + 1)).html(results[i].date);
            
            if (results[i].flights.length > 0) {
                var flighData = '';
                for (var j = 0; j < results[i].flights.length; j++) {
                   flighData += '<div class="row-fluid tab-flights"><div class="span6 div-left"><h4>Departure </h4><h5>Price:'+results[i].flights[j].price+' $</h5>'+results[i].flights[j].start.airportName+'<br>'+
                    results[i].flights[j].start.cityName+', '+results[i].flights[j].start.countryName+'<br>'+
                    results[i].flights[j].start.dateTime+'</div>'+'<div class="span6"><h4>Arrival</h4><h5>-------</h5>'+results[i].flights[j].finish.airportName+'<br>'+
                    results[i].flights[j].finish.cityName+', '+results[i].flights[j].finish.countryName+'<br>'+
                    results[i].flights[j].finish.dateTime+'</div></div>';                    
                }
              
            } else {
                $('#tab-pane' + (i + 1)).html('<p>There is not flights for this date</p>');
            }
            $('#tab-pane' + (i + 1)).html(flighData);
        }
         $('#loader').hide();
        $("#taskListDialog").modal('show');
    });

    request.fail(function (jqXHR, textStatus) {
         $('#loader').css('display','block');
        alert("Request failed, please be sure of completing all fields");
    });

    event.preventDefault();
});

