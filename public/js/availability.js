/**
 * Created by Gaurav on 18-11-2016.
 */
function getAvailability(train_no, coach, from, to, date) {
    var availResult = "<div class='panel panel-default'><div class='panel-heading'><div class='panel-title'>Availability</div></div><div class='panel-body'>";
    $.post("/search_trains/availability",
        {
            train_no: train_no,
            coach: coach,
            from: from,
            to: to,
            date: date
        }).done(function (data, status) {
        availResult += data;
    }).fail(function () {
        availResult += 'Some error occurred!';
    }).always(function () {
        availResult += "</div></div>";
        $('#availability_results').html(availResult);
    });
}
