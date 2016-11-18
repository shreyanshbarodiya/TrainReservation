$(function () {
    $("#search-from,#search-to").autocomplete({
        source: 'station/autocomplete',
        change: function (ev, ui) {
            if (!ui.item)
                $(this).val("");
        },
        minLength: 2
    });
});
