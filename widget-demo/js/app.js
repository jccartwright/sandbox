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
    "dojo/domReady"
], function(Map, MapView, DateTextBox, MemoryStore, FilteringSelect, globals, DatatypeWidget, esriRequest, on, topic) {

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
