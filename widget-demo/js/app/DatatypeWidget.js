define([
    'dojo/_base/declare',
    "dojo/Evented",
    'dojo/_base/lang',
    'dojo/on',
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetBase', 
    'esri/request',
    'dojo/text!./templates/DatatypeWidget.html'],
    function(
        declare,
        Evented,
        lang,
        on,
        _TemplatedMixin, 
        _WidgetBase,
        esriRequest,
        widgetTemplate
    ){
        return declare([_WidgetBase, _TemplatedMixin, Evented], {
            // Widget's HTML template
            templateString: widgetTemplate,

            // default options
            options: {
                datafile: "./js/app/datatypes.json"
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
            loadDatatypes: function() {
                // load the data file
                esriRequest(this.datafile, { responseType: "json"}).then(
                    function(response){
                        this.datatypes = response.data;
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
            }

        });
    });
