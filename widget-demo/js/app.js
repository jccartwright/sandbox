require([
    "esri/Map",
    "esri/views/MapView",
    "dijit/form/DateTextBox",
    "dojo/store/Memory", 
    "dijit/form/FilteringSelect",
    "app/Globals",
    "app/DatatypeWidget",
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
    esriRequest, 
    on, 
    topic,
    GraphicsLayer,
    Graphic,
    Extent,
    webMercatorUtils) {

    console.log("application name: ", globals.getName());
    var extentGraphic = null;
    var layer = new GraphicsLayer();

    var map = new Map({
        basemap: "topo-vector",
        layers: [layer]
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-118.80500, 34.02700],
        zoom: 13
    });

    // tool to draw area of interest on map
    view.ui.add("select-by-polygon", "top-left");
    const drawExtentButton = document.getElementById("select-by-polygon");

    let drawExtentBtnHandler = function() {
        if (extentGraphic) { view.graphics.remove(extentGraphic) }
        _setDrawHandler();
    };
      
    drawExtentButton.addEventListener("click", drawExtentBtnHandler);


    var datatypeWidget = new DatatypeWidget({datafile: './js/app/datatypes.json'}, 'datatypeWidgetDiv');
    datatypeWidget.startup();
    datatypeWidget.on('datatypes', function(datatypes){
        // console.log(datatypes)
    });

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


    var _setDrawHandler = function () {
        var origin = null;
        // Thanks to Thomas Solow (https://community.esri.com/thread/203242-draw-a-rectangle-in-jsapi-4x)
        var handler = view.on('drag', function (e) {
            e.stopPropagation();
            if (e.action === 'start') {
                if (extentGraphic) {
                    view.graphics.remove(extentGraphic);
                }
                ;
                origin = view.toMap(e);
            }
            else if (e.action === 'update') {
                //fires continuously during drag
                if (extentGraphic) {
                    view.graphics.remove(extentGraphic);
                }
                ;
                var p = view.toMap(e);
                extentGraphic = new Graphic({
                    geometry: new Extent({
                        xmin: Math.min(p.x, origin.x),
                        xmax: Math.max(p.x, origin.x),
                        ymin: Math.min(p.y, origin.y),
                        ymax: Math.max(p.y, origin.y),
                        spatialReference: { wkid: 102100 }
                    }),
                    symbol: fillSymbol
                }),
                    view.graphics.add(extentGraphic);
            }
            else if (e.action === 'end') {
                var _a = webMercatorUtils.webMercatorToGeographic(extentGraphic.geometry), xmin = _a.xmin, ymin = _a.ymin, xmax = _a.xmax, ymax = _a.ymax;
                // console.log(xmin, ymin, xmax, ymax);
                topic.publish("aoi/change", [xmin,ymin,xmax,ymax]);
                // remove the handler so map panning will work when not drawing
                handler.remove();
            }
        });
        return handler;
    };

    // Create a symbol for rendering the graphic
    var fillSymbol = {
        type: "simple-fill",
        color: [227, 139, 79, 0.5],
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    };
});
