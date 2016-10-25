$(document).ready(function () {
    var start = location.pathname.lastIndexOf('/');
    var activeLink = location.pathname.substr(start);

    $('a[href="' + activeLink + '"]').parent('li').addClass('active');
});
