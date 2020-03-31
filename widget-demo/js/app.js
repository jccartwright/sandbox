require([
    "esri/Map",
    "esri/views/MapView",
    "app/Globals",
    "app/DatatypeWidget"
], function(Map, MapView, globals, DatatypeWidget) {

    console.log("application name: ", globals.getName());

    var map = new Map({
        basemap: "topo-vector"
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-118.80500, 34.02700],
        zoom: 13
    });

    var datatypeWidget = new DatatypeWidget({datafile: './js/app/datatypes.json'}, 'datatypeWidgetDiv');
    datatypeWidget.startup();
    datatypeWidget.on('datatypes', function(datatypes){
        // console.log(datatypes)
    })


});
