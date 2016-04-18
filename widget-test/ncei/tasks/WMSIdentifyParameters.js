define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/io-query",
    "esri/geometry/screenUtils"
    ], function(
    declare,
    lang,
    ioQuery,
    screenUtils) {

        //"static" variables - shared across instances
        var INFO_FORMAT = "text/html";
        var WMS_VERSION = "1.3.0";

        return declare([], {
            _layers: null,
            _map: null,
            _urlTemplate: null,

            /* example WMS GetMap URL
            http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?REQUEST=GetMap&SERVICE=WMS
            &BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&reaspect=false&WIDTH=512&HEIGHT=512&CRS=EPSG:900913
            &LAYERS=EMODnet_Bathymetry_multi_beams_polygons&VERSION=1.3.0&FORMAT=image/png
            &SLD=http://maps.ngdc.noaa.gov/viewers/emodnet.sld&BBOX=-5009377.085697226,0,0,5009377.085697209
             */

            constructor: function(params) {
                this._map = params.map;

                //parse the WMS GetMap URL to derive the WMS GetFeatureInfo URL
                var url = params.wmsUrl.substring(0, params.wmsUrl.indexOf('?') + 1);
                var queryString = params.wmsUrl.substring(params.wmsUrl.indexOf('?') + 1, params.wmsUrl.length);
                var queryObject = ioQuery.queryToObject(queryString);

                //TODO look for case sensitivity in parameter keys
                this._layers = queryObject.LAYERS;
                this._crs = queryObject.CRS;

                this._urlTemplate = url + "REQUEST=GetFeatureInfo&SERVICE=WMS&WIDTH={width}&HEIGHT={height}&CRS={crs}"
                + "&LAYERS={layers}&QUERY_LAYERS={layers}&VERSION={version}&INFO_FORMAT={format}"
                + "&BBOX={minx},{miny},{maxx},{maxy}&i={col}&j={row}";
            },

            
            /**
             * return a WMS GetFeatureInfo URL constructed from GetMap request and map click event
             * @param evt
             * @returns String
             */
            getUrl: function(evt) {
                //GetFeatureInfo requires the row,column of mouseclick rather than geographic coordinate
                var screenGeom = screenUtils.toScreenGeometry(this._map.extent, this._map.width, this._map.height, evt.mapPoint);

                var params = {
                    version: WMS_VERSION,
                    format: INFO_FORMAT,
                    layers: this._layers,
                    width: this._map.width,
                    height: this._map.height,
                    crs: this._crs,
                    minx: this._map.extent.xmin,
                    miny: this._map.extent.ymin,
                    maxx: this._map.extent.xmax,
                    maxy: this._map.extent.ymax,
                    col: screenGeom.x,
                    row: screenGeom.y
                };

                return(lang.replace(this._urlTemplate, params));
            }
        });
});