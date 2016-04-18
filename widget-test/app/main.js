require([
    "esri/map",
    "dojo/request", 
    "dojo/dom", 
    "dojo/_base/array",
    'dojo/on',
    "app/dijits/AuthorWidget",
    "ncei/tasks/WMSIdentifyParameters",
    "ncei/tasks/WMSIdentifyTask",
    "dojo/domReady!"],
    function(Map, request, dom, arrayUtil, on, AuthorWidget, WMSIdentifyParameters, WMSIdentifyTask) {

    var map = new Map("map", {
        basemap: "topo",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
        center: [-122.45, 37.75], // longitude, latitude
        zoom: 13
    });

    var wmsUrl = "http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?REQUEST=GetMap&SERVICE=WMS&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&reaspect=false&WIDTH=512&HEIGHT=512&CRS=EPSG:900913&LAYERS=EMODnet_Bathymetry_multi_beams_polygons&VERSION=1.3.0&FORMAT=image/png&SLD=http://maps.ngdc.noaa.gov/viewers/emodnet.sld&BBOX=-5009377.085697226,0,0,5009377.085697209"

    var wmsIdentifyParameters = new WMSIdentifyParameters({map: map, wmsUrl: wmsUrl });
    var wmsIdentifyTask = new WMSIdentifyTask();
    on(wmsIdentifyTask, 'complete', function(evt) {
        console.log("WMSIdentifyTask completed successfully", evt);
    });
    on(wmsIdentifyTask, 'error', function(evt) {
        console.log("WMSIdentifyTask failed", evt);
    });


    on(map, 'click', function(evt){
        console.log(wmsIdentifyParameters.getUrl(evt));

        wmsIdentifyTask.execute().then(
            function(result) {
                console.log('execute completed', result);
            },

            function(error) {
                console.error(error);
            }
        );
    });




/*
    // Load up our authors
    request("data/authors.json", {
        handleAs: "json"
    }).then(function(authors){
        // Get a reference to our container
        var authorContainer = dom.byId("authorContainer");

        arrayUtil.forEach(authors, function(author){
            // Create our widget and place it
            var widget = new AuthorWidget(author).placeAt(authorContainer);
        });
    });
*/
});
