//
// Rakuten Test by Luca Mugnaini - Versione 1.1
//
/*global jQuery, document*/
//
var LucaTest = (function ($, d) {
    "use strict";
    var config = function () {
        // Characters limit typed by the user before the suggestion feature start working
        var minimumLenght = 3;
        return {
            minimumLenght: minimumLenght,
            language: 'en',
            // Shipping costs by country
            shippingCosts: {
                de: "€ 2.50",
                at: "€ 3.00",
                es: "€ 5.45",
                fr: "€ 2.00",
                uk: "£ 2.75"
            },
            // All messages are stored here in case they would need translation in the future
            textMessages: {
                en: {
                    typeToGetSuggestion: "Type " + minimumLenght + " characters for suggestions",
                    noCitiesFound: "No cities found starting with",
                    selectCountryFirst: "Select a country first",
                    yourCity: "Your city",
                    selectCountry: "select a country",
                    mapCountry: "Europe map",
                    mapCity: "City map"
                },
                it: {
                    typeToGetSuggestion: "Digita " + minimumLenght + " caratteri per i suggerimenti",
                    noCitiesFound: "Nessuna città trovata che inizia con",
                    selectCountryFirst: "Seleziona prima una nazione",
                    yourCity: "La tua città",
                    selectCountry: "select a country",
                    mapCountry: "Mappa dell'Europa",
                    mapCity: "Mappa della città"
                }
            },
            googleUrls: {
                markerSmall: "size:small%7Ccolor:red%7C",
                markerTiny: "size:tiny%7Ccolor:red%7C",
                mapCountry: "https://maps.googleapis.com/maps/api/staticmap?maptype=terrain&size=220x100&zoom=2&center=48,6",
                mapCity: "https://maps.googleapis.com/maps/api/staticmap?maptype=terrain&size=220x100&zoom=9&center=",
                markers: "markers="
            },
            geobytesUrls: {
                autoCompleteCity: "http://gd.geobytes.com/AutoCompleteCity?callback=?&filter=",
                getCityDetails: "http://gd.geobytes.com/GetCityDetails?callback=?&fqcn="
            }
        };
    };
    var verifyLang = function (lang) {
        // lang is a two charecters language code
        // This function need to be refactored in case there are other languages
        // It clean the language code. If it is not among the allowed languages,
        // it will default to English
        return (lang === "it") ? "it" : "en";
    };
    var domExctractLangugeFromHtml = function () {
        // Exctracting the language from the html page
        return $('#language').data('language');
    };
    var translatedText = function (textAllLanguages) {
        // Text is an hash where keys are two characters language code
        // and values are other hashes that contain the text.
        return textAllLanguages[verifyLang(domExctractLangugeFromHtml())];
    };
    var buildGoogleMapUrls = function (latitude, longitude) {
        // The two urls for the two Google maps are created using the latitude
        // and longitude provided by the public api
        // One of the map has fixed center, the other is centered on the city
        var g = config().googleUrls,
            lngLtd = latitude + "," + longitude,
            markerSmall = g.markerSmall + lngLtd,
            markerTiny = g.markerTiny + lngLtd,
            urlMapCountry = g.mapCountry + "&" + g.markers + markerTiny,
            urlMapCity = g.mapCity + lngLtd + "&" + g.markers + markerSmall;
        // console.log(urlMapCountry);
        // alert(JSON.stringify(myData));
        return ({urlMapCountry: urlMapCountry, urlMapCity: urlMapCity});
    };
    var domUpdateMaps = function (latitude, longitude) {
        var urls = buildGoogleMapUrls(latitude, longitude);
        $("#map_country").attr("src", urls.urlMapCountry);
        $("#map_city").attr("src", urls.urlMapCity);
        $("#maps_container").slideDown();
    };
    var getCityLatLng = function (city, url, callback) {
        // Function to retrieve the latitude and longitude, once the user
        // selected one of the city
        if (city) {
            $.getJSON(
                url + city,
                function (data) {
                    callback(data.geobyteslatitude, data.geobyteslongitude);
                }
            );
        }
    };
    var domInitialize = function () {
        // Load the text, translated by the language that is set in the html and the configuration
        // This function is too large, it needs to be splitted
        var c = config();
        var t = translatedText(c.textMessages);
        // Initializing the form from the no-javascript version (Graceful Degradation)
        $("#field_city").prop('disabled', true).prop("placeholder", t.selectCountryFirst);
        $("#field_shipping").text(t.selectCountryFirst);
        // Injecting the maps container, and hiding it. Maps will only appear on city selection
        $("#maps_div").append('<div id="maps_container" style="display: none"></div>');
        $("#maps_container").append('<img id="map_city" src="" alt="' + t.mapCity + '" /><img id="map_country" src="" alt="' + t.mapCountry + '" />');
        // Event for when user interact with the country dropdown menu
        $('#field_country').change(function () {
            if ($(this).val() === t.selectCountry) {
                // User bring back the drop down menu to the default status
                // Disable the city input field and restore the placeholder
                $("#field_city").prop("disabled", true).prop("placeholder", t.selectCountryFirst);
                $("#no_city").text("");
                $("#field_shipping").text(t.selectCountryFirst);
            } else {
                // User select a valid country
                // Enable the city input field and change the placeholder
                // The city field also get the focus
                $("#field_city").prop("disabled", false).prop("placeholder", t.yourCity);
                $("#no_city").removeClass("error").addClass("note").text(t.typeToGetSuggestion).blink();
                $("#field_shipping").text(c.shippingCosts[$(this).val()]); // Updating the shipping cost
                $("#field_city").focus().blink();
            }
            // In either cases the city field is cleaned and the maps hidden
            $("#field_city").val("");
            $("#maps_container").slideUp();
        });
        $('#field_city').keyup(function () {
            // alert("ciao");
            if ($(this).val().length < c.minimumLenght) {
                // Removing the error message in case the field contain less than minimumLenght characters
                $("#no_city").removeClass("error").addClass("note").text(t.typeToGetSuggestion);
            }
        });
        // Initializing and setting the configuration for the autocomplete functionality
        $("#field_city").autocomplete({
            source: function (request, response) {
                // console.log(urlForApi);
                $.getJSON(
                    // Injecting the country filter in the url and the request term as per user typing
                    c.geobytesUrls.autoCompleteCity + $('#field_country').val() + "&q=" + request.term,
                    function (returnedAutoComplete) {
                        // "returnedAutoComplete" contains the result in a form of array. For example:
                        // ["Bergen, NI, Germany","Berlin, BE, Germany"]
                        if (returnedAutoComplete[0] === "" && Object.keys(returnedAutoComplete).length === 1) {
                            // No cities found. In this case the public api still
                            // return an array with one element that is empty, generating
                            // a suggestion drop down menu with an empty row.
                            // This is not a good behaviour from an usability stand point.
                            // So I removed this item from the array and I show an error
                            // message under the text box
                            returnedAutoComplete = [];
                            $("#no_city").removeClass("note").addClass("error").text(t.noCitiesFound + " \"" + request.term + "\"").blink();
                        } else {
                            $("#no_city").text("");
                        }
                        response(returnedAutoComplete);
                    }
                );
            },
            // Search activated after minimumLenght characters are typed
            minLength: c.minimumLenght,
            select: function (event, ui) {
                // When user select one of the suggested cities, the latitude and longitude
                // is requested with the function getCityLatLng
                var selectedObj = ui.item;
                var selectedCity = selectedObj.value;
                $("#field_city").val(selectedCity);
                getCityLatLng(selectedCity, c.geobytesUrls.getCityDetails, domUpdateMaps);
                return false;
            },
            open: function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
        });
        $("#field_city").autocomplete("option", "delay", 100);
    };
    // Extending jQuery methods
    $.fn.extend({
        blink: function () {
            var backColor = this.css("background-color"),
                fontColor = this.css("color");
            return this.css({"background-color": "#77c2ec", color: "white"}).animate({backgroundColor: backColor, color: fontColor}, 400);
        }
    });
    // Starting everything once the dom is ready
    $(d).ready(function () {
        domInitialize();
        // To thest the maps, uncomment the following line
        // domUpdateMaps(43.76, 11.17);
    });
    return {
        // Exposing public methods for Unit Testing with Jasmine
        config: config,
        getCityLatLng: getCityLatLng,
        verifyLang: verifyLang
    };
}(jQuery, document));
