$ (function () {
    $("#search-from,#search-to").autocomplete({
       source:'station/autocomplete',
       minLength: 2
    });
});
