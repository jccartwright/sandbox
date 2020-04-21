/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import watchUtils = require("esri/core/watchUtils");

import { renderable, tsx } from "esri/widgets/support/widget";

import Point = require("esri/geometry/Point");
import MapView = require("esri/views/MapView");
// import { SimpleFillSymbol, SimpleLineSymbol } from "esri/symbols";
// import Color from "esri/Color";
import { Extent } from "esri/geometry";
import Graphic from "esri/Graphic";
import webMercatorUtils = require("esri/geometry/support/webMercatorUtils");

let extentGraphic: Graphic = null;

const fillSymbol = {
  type: "simple-fill",
  color:  [227, 139, 79, 0.5],
  outline: {
    color: [255, 255, 255],
    width: 1
  }    
};


type Coordinates = Point | number[] | any;




interface State {
  interacting: boolean;
  coordinates: Coordinates;
}

interface Style {
  backgroundColor: string;
}

const CSS = {
  base: "drawextent-tool"
};

@subclass("esri.widgets.DrawExtent")
class DrawExtent extends declared(Widget) {

  constructor(params?: any) {
    super();
    this.state = {
      coordinates: null,
      interacting: false
    };
  }

  postInitialize() {

  }

  //--------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------

  //----------------------------------
  //  view
  //----------------------------------

  @property()
  @renderable()
  view: MapView;

  //----------------------------------
  //  initialCenter
  //----------------------------------

  @property()
  @renderable()
  initialCenter: Coordinates;

  @property()
  coordinates: Coordinates;

  //----------------------------------
  //  state
  //----------------------------------

  @property()
  @renderable()
  state: State;




  //-------------------------------------------------------------------
  //
  //  Public methods
  //
  //-------------------------------------------------------------------

  render() {
    const { interacting } = this.state;
    const styles: Style = {
      backgroundColor: interacting ? "red" : ""
    };
    return (
      <div
        bind={this}
        class={CSS.base}
        onclick={this._toolClickHandler}>
        <div styles={styles} class="esri-widget esri-widget--button esri-widget esri-interactive">
          <span class="esri-icon-sketch-rectangle"></span>
        </div>
      </div>
    );
  }

  //-------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------


  private _toolClickHandler() {
    if (extentGraphic) {
      this.view.graphics.remove(extentGraphic);
    }
    this.state.interacting = true;
    this._drawHandler();
  }

  private _drawHandler() {
    let origin: any = null;
                
    // Thanks to Thomas Solow (https://community.esri.com/thread/203242-draw-a-rectangle-in-jsapi-4x)
    let dragHandler = this.view.on("drag", e => {
        e.stopPropagation();
        if (e.action === "start") {
          origin = this.view.toMap(e);

        } else if (e.action === "update") {
            //fires continuously during drag
            if (extentGraphic) {
                this.view.graphics.remove(extentGraphic);
            }
            let p = this.view.toMap(e);
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
            this.view.graphics.add(extentGraphic);

        } else if (e.action === "end") {
            let { xmin, ymin, xmax, ymax } = webMercatorUtils.webMercatorToGeographic(extentGraphic.geometry) as Extent; 
            // console.log(xmin, ymin, xmax, ymax);

            // store w/ a reasonable coordinate precision. TODO: make configurable? 
            this.coordinates = [xmin, ymin, xmax, ymax].map(x => x.toFixed(5));
            // topic.publish(this.topicName, [xmin,ymin,xmax,ymax]);
            // remove the handler so map panning will work when not drawing
            dragHandler.remove();
            this.state.interacting = false;
            // this.domNode.setAttribute("style", "");
        }
    });
  }

}


export = DrawExtent;
