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

            // CSS class to be applied to the root node in our template
            baseClass: 'DatatypeWidget',

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
            },


            destroy: function() {
                // console.log('inside destroy...')
                this.inherited(arguments);
            },


            //
            // utility methods
            //
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
                    // the following works w/ both "on" and subscribe
                    topic.publish("datatype/change", datatype);
                    // following works w/ "on" but not w/ subscribe
                    // this.emit("datatype/change", datatype);

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
