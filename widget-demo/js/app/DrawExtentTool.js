define([
    'dojo/_base/declare',
    'dojo/Evented',
    'dojo/_base/lang',
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetBase',
    'dojo/topic',
    'esri/Graphic', 
    'esri/geometry/Extent', 
    'esri/geometry/support/webMercatorUtils',
    'dojo/text!./templates/DrawExtentTool.html'],
    function(
        declare,
        Evented,
        lang,
        _TemplatedMixin, 
        _WidgetBase,
        topic,
        Graphic,
        Extent,
        webMercatorUtils,
        widgetTemplate
    ){
        return declare([_WidgetBase, _TemplatedMixin, Evented], {
            // Widget's HTML template
            templateString: widgetTemplate,

            extentGraphic: null,

            // non-null value indicates draw tool is active
            _dragHandler: null,

            // default options
            options: {
                fillColor: [227, 139, 79, 0.5],
                outlineColor: [255, 255, 255],
                topicName: "aoi/change"
            },

            // CSS class to be applied to the root node in our template
            baseClass: 'DrawExtentTool',

            //
            // Widget lifecycle methods. defined in the order in which they are called
            //
            constructor: function(options, srcRefNode) {
                // console.log('inside constructor...');
                var defaults = lang.mixin({}, this.options, options);
                this.domNode = srcRefNode;
                this.set("mapView", options.mapView);
                this.set("outlineColor", defaults.outlineColor);
                this.set("fillColor", defaults.fillColor);
                // name used by topic when publishing results
                this.set("topicName", defaults.topicName);
            },

            
            postCreate: function() {
                // console.log('inside postCreate')
                // assume we are overridng a method that may do something in a class up the inheritance chain
                this.inherited(arguments);
                this.fillSymbol = this.createFillSymbol();
            },


            startup: function() {
            //   console.log('inside startup...');
                if (! this.mapView) {
                    this.destroy();
                    console.error("DrawExtent::a MapView instance must be provided");
                }

            },

            destroy: function() {
                // console.log('inside destroy...')
                this.inherited(arguments);
            },


            //
            // utility methods
            //
            _toolActivationHandler: function() {
                this.domNode.setAttribute("style", "background-color:red");

                if (this.extentGraphic) {
                    this.mapView.graphics.remove(this.extentGraphic);
                }
                let dragEventHandler = this._dragEventHandler.bind(this);
                dragEventHandler();
            },


            _dragEventHandler: function() {
                var origin = null;
                
                // Thanks to Thomas Solow (https://community.esri.com/thread/203242-draw-a-rectangle-in-jsapi-4x)
                this._dragHandler = this.mapView.on('drag', function (e) {
                    e.stopPropagation();
                    if (e.action === 'start') {
                        if (this.extentGraphic) {
                            this.mapView.graphics.remove(this.extentGraphic);
                        };
                        origin = this.mapView.toMap(e);
                    }
                    else if (e.action === 'update') {
                        //fires continuously during drag
                        if (this.extentGraphic) {
                            this.mapView.graphics.remove(this.extentGraphic);
                        };
                        var p = this.mapView.toMap(e);
                        this.extentGraphic = new Graphic({
                            geometry: new Extent({
                                xmin: Math.min(p.x, origin.x),
                                xmax: Math.max(p.x, origin.x),
                                ymin: Math.min(p.y, origin.y),
                                ymax: Math.max(p.y, origin.y),
                                spatialReference: { wkid: 102100 }
                            }),
                            symbol: this.fillSymbol
                        }),
                        this.mapView.graphics.add(this.extentGraphic);

                    } else if (e.action === 'end') {
                        var _a = webMercatorUtils.webMercatorToGeographic(this.extentGraphic.geometry), xmin = _a.xmin, ymin = _a.ymin, xmax = _a.xmax, ymax = _a.ymax;
                        // console.log(xmin, ymin, xmax, ymax);
                        topic.publish(this.topicName, [xmin,ymin,xmax,ymax]);
                        // remove the handler so map panning will work when not drawing
                        this._dragHandler.remove();
                        this.domNode.setAttribute("style", "");
                    }
                }.bind(this));
            },


            createFillSymbol: function() {
                return {
                type: "simple-fill",
                color: this.fillColor,
                    outline: {
                        color: this.outlineColor,
                        width: 1
                    }    
                }
            }
        });
    });
