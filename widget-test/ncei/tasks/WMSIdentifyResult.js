define([
    "dojo/_base/declare"
], function(
    declare) {

    //"static" variables - shared across instances

    return declare([], {

        constructor: function(url) {
            console.log('inside constructor for WMSIdentifyResult...');
        }
    });
});