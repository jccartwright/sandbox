require([
    "esri/Map",
    "esri/views/MapView",
    "dijit/form/DateTextBox",
    "dojo/store/Memory", 
    "dijit/form/FilteringSelect",
    "app/Globals",
    "app/DatatypeWidget",
    "app/ObservationCategoryWidget",
    "app/CollectiontypeWidget",
    "app/DrawExtentTool",
    'esri/request',
    'dojo/on',
    "dojo/topic",
    "esri/layers/GraphicsLayer", 
    "esri/Graphic", 
    "esri/geometry/Extent", 
    "esri/geometry/support/webMercatorUtils",
    "dojo/domReady"
], function(
    Map, 
    MapView, 
    DateTextBox, 
    MemoryStore, 
    FilteringSelect, 
    globals, 
    DatatypeWidget,
    ObservationCategoryWidget,
    CollectiontypeWidget,
    DrawExtentTool,
    esriRequest, 
    on, 
    topic,
    GraphicsLayer,
    Graphic,
    Extent,
    webMercatorUtils) {

    console.log("application name: ", globals.getName());

    var map = new Map({
        basemap: "topo-vector",
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-118.80500, 34.02700],
        zoom: 13
    });

    // demonstrate FilteringSelect, autocomplete, load from external datafile
    var datatypeWidget = new DatatypeWidget({datafile: './js/app/datatypes.json'}, 'datatypeWidgetDiv');
    datatypeWidget.startup();
    // listens for message sent via emit() 
    datatypeWidget.on('datatypes', function(datatypes){
        console.log('match: '+datatypes)
    });

    // demonstrate programatically populated Select element
    const observationCategorySelector = new ObservationCategoryWidget({}, 'observationCategoryWidgetDiv');
    observationCategorySelector.startup();

    // demonstrate programatically populated Radio Buttons
    const collectiontypeSelector = new CollectiontypeWidget({}, 'collectiontypeWidgetDiv');
    collectiontypeSelector.startup();

    // tool to draw area of interest on map
    var drawExtentTool = new DrawExtentTool({
        mapView: view, 
        outlineColor: [0,0,0]
    }, 'drawExtentToolDiv');
    // lifecycle method 'startup' called automatically when added to View UI
    view.ui.add(drawExtentTool, "top-left");


    // uncomment the line below to enable FilteringSelect
    // loadDatatypes('./js/app/datatypes.json');

    // add the date input
    var datebox = new DateTextBox({
        constraints: {datePattern:'yyyy-MM-dd'}
    }, "dateTextBoxDiv");
    datebox.startup();
    on(datebox, 'change', function(value) {
        console.log(value);
    });

    // do something with the datatype value
    topic.subscribe("datatype/change", function(){
        console.log('datatype changed to: ', arguments[0]);
    })
    
    // do something with the area of interest
    topic.subscribe("aoi/change", function(){
        console.log('area of interest set to: ', arguments[0]);
    })


    function loadDatatypes(datafile) {
        // load the data file
        esriRequest(datafile, { responseType: "json"}).then(
            function(response){
                // representative record: {value: "ABSOLUTE HUMIDITY", label: "ABSOLUTE HUMIDITY", id: "567"}
                dataTypes = response.data;

                // create a memory store from the results
                memoryStore = new MemoryStore({data: response.data, idProperty: "id" });
                // create the Select using the store. "id" must be unique even across dijits 
                var filteringSelect = new FilteringSelect({
                    id: "myDatatypeSelect",
                    name: "datatype",
                    store: memoryStore,
                    placeHolder: "Select a datatype",
                    required: false,
                    searchAttr: "value",
                    identifier: "value",
                    onChange: datatypeChangeHandler,
                }, "filteringSelectDiv").startup();
                // unless called separately, variable filteringSelect is undefined below. Don't understand why
                //filteringSelect.start();

                // alternative way to handle event
                // on(filteringSelect, 'change', function(evt){
                //     console.log('datatype is !'+evt);
                // })
                
            },
            function(error){
                console.log('failed to load data file');
        });
    }

    function datatypeChangeHandler(datatype) {
        // datatype not required so ignore empty values 
        if(datatype) { 
            topic.publish("datatype/change", datatype);
        }
    }
});
