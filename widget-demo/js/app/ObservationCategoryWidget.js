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
    'dojo/text!./templates/ObservationCategoryWidget.html'],
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
                widgetName: "ObservationCategory"
            },

            // CSS class to be applied to the root node in our template
            baseClass: 'ObservationCategoryWidget',

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
                this.set("name", defaults.widgetName);
            },

            
            postCreate: function() {
                // console.log('inside postCreate')
                // assume we are overridng a method that may do something in a class up the inheritance chain
                this.inherited(arguments);
                this.populateCategorySelect();
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

            updateCategory: function(event) {
                console.log('category is now '+event.target.value);
            }
        });
    });
