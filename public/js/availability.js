/**
 * Created by Gaurav on 18-11-2016.
 */
function getAvailability(train_no, coach_class, from, to, date, dob) {
    var availResult = "<div class='panel panel-default'><div class='panel-heading'><div class='panel-title'>Availability</div></div><div class='panel-body'><p>";
    var fareResult = "<div class='panel panel-default'><div class='panel-heading'><div class='panel-title'>Fare</div></div><div class='panel-body'>";
    $.post("/search_trains/availability",
        {
            train_no: train_no,
            coach_class: coach_class,
            from: from,
            to: to,
            date: date
        }).done(function (data, status) {
        availResult += data.availability;
        availResult += '</p><a href="/booking_form/'+train_no+'/'+coach_class+'/'+from+'/'+to+'/'+date+'/'+dob+'">Book now</a>';
        fareResult += '&#x20B9;'+data.fare;
        fareResult += "</div></div>";
        $('#fare_results').html(fareResult);
    }).fail(function () {
        availResult += 'Some error occurred!';
    }).always(function () {
        availResult += "</div></div>";
        $('#availability_results').html(availResult);
    });
}
