define([
    'dojo/_base/declare',
    "dojo/Evented",
    'dojo/_base/lang',
    'dojo/on',
    'dojo/store/Memory',
    'dijit/form/FilteringSelect',
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',
    "dojo/topic",
    'esri/request',
    'dojo/text!./templates/DatatypeWidget.html'],
    function(
        declare,
        Evented,
        lang,
        on,
        MemoryStore,
        FilteringSelect,
        _TemplatedMixin, 
        _WidgetBase,
        _WidgetsInTemplateMixin,
        topic,
        esriRequest,
        widgetTemplate
    ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
            // Widget's HTML template
            templateString: widgetTemplate,

            // default options
            options: {
                datafile: "./js/app/datatypes.json",
                name: "myname"
            },

            datatypes: null,

            collections: [
                {value: 1, label: 'one'},
                {value: 2, label: 'two'},
                {value: 3, label: 'three'}
            ],

            // CSS class to be applied to the root node in our template
            baseClass: 'DatatypeWidget',

            obsCategories: [
                {"name":"Benthic FOCE type studies","value":["Benthic FOCE-type study"],"cssClass":"obscat" },
                {"name":"Benthic mesocosm","value":[""],"cssClass":"obscat" },
                {"name":"Drifting buoy (Lagrangian studies)","value":["drifting buoy"],"cssClass":"obscat" },
                {"name":"Fish examination","value":["fish examination"],"cssClass":"obscat" },
                {"name":"Laboratory experiment","value":["laboratory experiments"],"cssClass":"obscat" },
                {"name":"Marine mammal observation","value":["marine mammal observation"],"cssClass":"obscat" },
                {"name":"Model output","value":["model output"],"cssClass":"obscat" },
                {"name":"Natural perturbation site studies","value":[""],"cssClass":"obscat" },
                {"name":"Pelagic mesocosm","value":[""],"cssClass":"obscat" },
                {"name":"Profile/CTD","value":["profile"],"cssClass":"obscat" },
                {"name":"Pump cast","value":["pump cast"],"cssClass":"obscat" },
                {"name":"Surface underway","value":["Surface underway"],"cssClass":"obscat" },
                {"name":"Time series (e.g., moorings)","value":["time series"],"cssClass":"obscat" },
                {"name":"Tows","value":["tows"],"cssClass":"obscat" },
                {"name":"Undulating profile (glider, etc)","value":["undulating profile"],"cssClass":"obscat" }
            ],

            //
            // Widget lifecycle methods. defined in the order in which they are called
            //
            constructor: function(options, srcRefNode) {
                // console.log('inside constructor...');
                var defaults = lang.mixin({}, this.options, options);
                this.domNode = srcRefNode;
                this.set("datafile", defaults.datafile);
            },

            
            postCreate: function() {
                // console.log('inside postCreate')
                // assume we are overridng a method that may do something in a class up the inheritance chain
                this.inherited(arguments);
                this.loadDatatypes();
                on(this._datatypeText, 'keyup', lang.hitch(this, this.getMatchingValues));

                this.populateCategorySelect();

                this.createInputRadios(this.collections);
            },


            destroy: function() {
                // console.log('inside destroy...')
                this.inherited(arguments);
            },


            //
            // utility methods
            //
            populateCategorySelect: function() {
                var select = this._categorySelect;
                var categories = this.obsCategories.map(element => element.name);
                categories.forEach(function(category){
                    var option = document.createElement("option");
                    option.value = category;
                    option.text = category;
                    select.add(option);
                })
            },


            createInputRadios: function(collections) {
                this.collections.forEach(function(collection){
                    var radioDiv = this.createCollectionRadioButton(collection);
                    this._collectionDiv.appendChild(radioDiv);    
                }.bind(this));
            },


            createCollectionRadioButton: function(collection) {
                var radioDiv = document.createElement("div");
                var radioBtn = document.createElement("input");
                radioBtn.setAttribute("type", "radio");
                radioBtn.setAttribute("name", "collection");
                radioBtn.setAttribute("value", collection.value);
                radioBtn.addEventListener('click', function(){
                     console.log(this.value)
                });
                radioDiv.appendChild(radioBtn);
                
                var radioLabel = document.createElement("label");
                radioLabel.innerHTML = collection.label;
                radioDiv.appendChild(radioLabel);
                return(radioDiv);
            },


            updateCategory: function(event) {
                console.log('category is now '+event.target.value);
            },

            updateDatatype: function(event) {
                var str = this._datatypeText.value;
                var regex = RegExp(str, 'i');
                var results = this.datatypes.filter(element => element.value.match(regex)).map(element => element.value);
                console.log(results);
            },


            loadDatatypes: function() {
                // load the data file
                esriRequest(this.datafile, { responseType: "json"}).then(
                    function(response){
                        this.datatypes = response.data;
                        this.memoryStore = new MemoryStore({data: response.data, idProperty: "id" });
                        this.createFilteringSelect().bind(this);
                    }.bind(this),
                    function(error){
                        console.log('failed to load data file');
                });
            },


            // return list of datatypes whose values contain at least a partial, case-insensitive, match with the given string
            getMatchingValues: function() {
                var str = this._datatypeText.value;
                var regex = RegExp(str, 'i');
                var results = this.datatypes.filter(element => element.value.match(regex)).map(element => element.value);
                // console.log(results);
                this.emit('datatypes', results);
            },

            datatypeChangeHandler: function(datatype) {
                // datatype not required so ignore empty values 
                if(datatype) { 
                    // console.log(datatype);
                    // topic.publish("datatype/change", datatype);
                    this.emit("datatype/change", datatype);

                }
            },

            createFilteringSelect: function() {
                var filteringSelect = new FilteringSelect({
                    id: "datatypeSelect",
                    name: "datatype",
                    store: this.memoryStore,
                    placeHolder: "Select a datatype",
                    required: false,
                    searchAttr: "value",
                    identifier: "value",
                    onChange: this.datatypeChangeHandler.bind(this),
                }, this._filteringSelectDiv);
                // startup() not needed when used in template?
            }

        });
    });
