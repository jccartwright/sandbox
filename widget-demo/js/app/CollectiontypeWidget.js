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
    'dojo/text!./templates/CollectiontypeWidget.html'],
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
                name: "CollectiontypeWidget"
            },

            collections: [
                {value: 1, label: 'Collection One'},
                {value: 2, label: 'Collection Two'},
                {value: 3, label: 'Collection Three'}
            ],

            // CSS class to be applied to the root node in our template
            baseClass: 'CollectiontypeWidget',


            //
            // Widget lifecycle methods. defined in the order in which they are called
            //
            constructor: function(options, srcRefNode) {
                // console.log('inside constructor...');
                var defaults = lang.mixin({}, this.options, options);
                this.domNode = srcRefNode;
            },

            
            postCreate: function() {
                // console.log('inside postCreate')
                // assume we are overridng a method that may do something in a class up the inheritance chain
                this.inherited(arguments);
                this.createInputRadios(this.collections);
            },


            destroy: function() {
                // console.log('inside destroy...')
                this.inherited(arguments);
            },


            //
            // utility methods
            //
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
                     console.log('collection type: '+this.value)
                });
                radioDiv.appendChild(radioBtn);
                
                var radioLabel = document.createElement("label");
                radioLabel.innerHTML = collection.label;
                radioDiv.appendChild(radioLabel);
                return(radioDiv);
            }
        });
    });
