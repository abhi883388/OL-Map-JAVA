import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import KML from "ol/format/KML";
import GeoJSON from "ol/format/GeoJSON";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import Stamen from "ol/source/Stamen";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import ol from "/ol.js";

var styleCache = {};
var styleFunction = function(feature) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  var name = feature.get("name");
  var magnitude = parseFloat(name.substr(2));
  var radius = 4 + 20 * (magnitude - 5);
  var style = styleCache[radius];
  if (!style) {
    style = new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({
          color: "rgb(191, 63, 63)"
        }),
        stroke: new Stroke({
          color: "rgb(191, 63, 63)",
          width: 1
        })
      })
    });
    styleCache[radius] = style;
  }
  return style;
};

var vector = new VectorLayer({
  source: new VectorSource({
    url: "data/kml/2012_Earthquakes_Mag5.kml",
    format: new KML({
      extractStyles: false
    })
  }),
  style: styleFunction
});
var labelStyle = new Style({
  text: new Text({
    font: "12px Calibri,sans-serif",
    overflow: true,
    fill: new Fill({
      color: "#000"
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 3
    })
  })
});
var countryStyle = new Style({
 
  stroke: new Stroke({
    color: "#319FD3",
    width: 1
  })
});
var style = [countryStyle];

var vectorLayer1 = new VectorLayer({
  source: new VectorSource({
    url: "data/geojson/countries.geojson",
    format: new GeoJSON()
  }),
  style: function(feature) {
    //labelStyle.getText().setText(feature.get("name"));
    return style;
  },
  declutter: true
});

var raster = new TileLayer({
  source: new Stamen({
    layer: "toner"
  })
});

var other = new TileLayer({
  source: new ol.source.OSM()
});

var map = new Map({
  layers: [vector, vectorLayer1],
  target: "map",
  view: new View({
    center: ol.proj.fromLonLat([77.41, 21.82]),
    zoom: 4.5
  })
});

var info = $("#info");
info.tooltip({
  animation: false,
  trigger: "manual"
});

var displayFeatureInfo = function(pixel) {
  info.css({
    left: pixel[0] + "px",
    top: pixel[1] - 15 + "px"
  });
  var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  });
  if (feature) {
    info
      .tooltip("hide")
      .attr("data-original-title", feature.get("name"))
      .tooltip("fixTitle")
      .tooltip("show");
  } else {
    info.tooltip("hide");
  }
};

map.on("pointermove", function(evt) {
  if (evt.dragging) {
    info.tooltip("hide");
    return;
  }
  displayFeatureInfo(map.getEventPixel(evt.originalEvent));
});

map.on("click", function(evt) {
  displayFeatureInfo(evt.pixel);
});
