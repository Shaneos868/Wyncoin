import mapboxgl from 'mapbox-gl';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import MapPopup from '../component/MapPopup';

const addMarkerToMap = (document, map, vendor, popupId, handleDirectionClick) => {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';
    // make a marker for each feature and add to the map
    let popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(ReactDOMServer.renderToStaticMarkup(
        <MapPopup 
          styleName={popupId}
          vendor={vendor} 
        />))
    popup.on('open', (e)=> {
      document.getElementById(popupId).addEventListener('click', async (f)=>{
        let routeData = await handleDirectionClick(e.target._lngLat);
        addDirections(map, routeData, document);
      });
    });
    let marker = new mapboxgl.Marker(el)
      .setLngLat(vendor.geometry.coordinates)
      // add popups
      .setPopup(popup);
    marker.addTo(map);
    return map;
};

const addDirections = (map, routeData, document) => {
  let {data} = routeData;
  let route = data.routes[0].geometry;
  map.addLayer({
    id: 'route',
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route
      }
    },
    paint: {
      'line-width': 2
    }
  });
  let start = data.waypoints[0].location;
  let end = data.waypoints[1].location;
  let startLayer = {
    id: 'start',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: start
        },
        properties: {}
      }
    }
  }
  map.addLayer(startLayer);
  map.addLayer({
    id: 'end',
    type: 'circle',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: end
        }
      }
    }
  });
  var instructions = document.getElementById('instructions');
  instructions.className = "visible";
  var steps = data.routes[0].legs[0].steps;
  steps.forEach(function(step) {
    instructions.insertAdjacentHTML('beforeend', '<p>' + step.maneuver.instruction + '</p>');
  });
}


const popupListeners = () => {

};


export {addMarkerToMap};