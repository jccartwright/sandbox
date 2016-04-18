define([
    "dojo/_base/declare",
    "dojo/request",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Evented",
    "ncei/tasks/WMSIdentifyResult",
    "ncei/tasks/WMSIdentifyParameters"
], function(
    declare,
    request,
    domConstruct,
    query,
    lang,
    topic,
    Evented,
    WMSIdentifyResult,
    WMSIdentifyParameters) {

    //"static" variables - shared across instances
    var SAMPLE_REQUEST = "http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?REQUEST=GetFeatureInfo&SERVICE=WMS&WIDTH=1273&HEIGHT=678&CRS=EPSG:900913&LAYERS=EMODnet_Bathymetry_single_beams_points,EMODnet_Bathymetry_single_beams_lines&QUERY_LAYERS=EMODnet_Bathymetry_single_beams_points,EMODnet_Bathymetry_single_beams_lines&VERSION=1.3.0&INFO_FORMAT=text/html&BBOX=-10457618.218592547,3129520.3096675253,1997336.9183039004,9763031.372366497&i=607&j=374";

    return declare([Evented], {
        url: null,

        constructor: function(url) {
            this.url = url;
        },

        //TODO emit, complete, error events
        execute: function(identifyParameters, callback, errback) {
            var deferred = request.get(SAMPLE_REQUEST);

            deferred.then(
                lang.hitch(this, function(text) {

                    //scrape the HTML response for data since the plain text
                    //format does not seem to contain all the information
                    var responseFragment = domConstruct.toDom(text);
                    var headerFields = [];
                    query("th", responseFragment).forEach(function(node, index, nodelist){
                        headerFields.push(node.innerHTML);
                    });

                    //list of returned features. Each element is a hash of attribute values
                    var responseData = [];

                    query("tbody > tr", responseFragment).forEach(function(node, index, nodelist){
                        var tr = {};
                        query("td", node).forEach(function (node, index, nodelist) {
                            tr[headerFields[index]] = node.innerHTML;
                        });
                        responseData.push(tr);
                    });

                    //console.log(responseData);
                    this.emit('complete', {results: responseData});
                }),


                function(error) {
                    console.error("Error occurred with GetFeatureInfo request: ", error);
                    this.emit('error', {error: error});
                }
            );

            return deferred;
        }
    });
});