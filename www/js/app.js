/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
require.config({

    baseUrl: 'lib',

    paths: {
        // folders
        app: '../js',
        utils: '..//js/utils',
        tpl: '../tpl',
        // libraries
        'i18n': 'i18next.amd.withJQuery.min',
        'jquery': 'jquery-2.1.0.min',
        marionette: 'backbone.marionette'
    },
    map: {
        '*': {
            'app/models': 'app/models/memory'
        }
    },
    shim: {
        'handlebars': {
            exports: 'Handlebars'
        },
        marionette: {
            deps: ['jquery', 'backbone'],
            exports: 'Marionette'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        }
    }

});

require(['jquery', 'backbone', "fastclick", 'app/router', 'i18n'], function ($, Backbone, FastClick, Router, i18n) {

    "use strict";

    var lang    = "",
        locale  = "en-AU";  // default

    // get the user's locale - mobile or web
    if (typeof navigator.globalization !== 'undefined') {
        // on mobile phone
        navigator.globalization.getLocaleName(
            function (loc) {locale = loc.value; },
            function () {console.log('Error getting locale\n'); }
        );
    } else {
        // in web browser
        lang = navigator.language.split("-");
        locale = lang[0];
    }
//    console.log("locale:" + locale);
    // initialize / load the localization info
    i18n.init({
        lng: locale,
        debug: true,
        fallbackLng: 'en'
    }, function () {
        // i18next is done asynchronously; this is the callback function
        // Tell backbone we're ready to start loading the View classes.
        Backbone.history.start();
    });
    
    var router = new Router();
    
    var l = function (string) {
        return string.toLocaleString();
    };

    $(function () {
        FastClick.attach(document.body);
    });
    
    $("body").on("click", ".back-button", function (event) {
        event.preventDefault();
        window.history.back();
    });

});