import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import React from 'react';
import ReactDOMServer from 'react-dom/server'
import config from '../config';
import MapPopup from '../component/MapPopup';

mapboxgl.accessToken = config.mapboxAPIKey;

const getVendors = async (geoLoc) => {
  return await axios.get(`/vendors?long=${geoLoc[0]}&lat=${geoLoc[1]}`)
}

const initMap = async(mapContainer, handleDirectionClick) =>{
  let geoLoc;
  let map;
  // get current location
  let position = await loadPosition();
  geoLoc = [position.coords.longitude, position.coords.latitude];

  // initialize map
  map = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/streets-v9',
    center: geoLoc,
    zoom: 12
  });

  // add Nav control
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-right');
  // add GeoLocate
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
  }));

  // add markers to map
  let res = await getVendors(geoLoc);
  let geojson = res.data;
  geojson.features.forEach(function (vendor,i) {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';
    // make a marker for each feature and add to the map
    let popupId = `popup-${i}`
    let popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(ReactDOMServer.renderToStaticMarkup(
        <MapPopup 
          styleName={popupId}
          vendor={vendor} 
        />))
    popup.on('open', (e)=>{
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
  });
}

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

const loadPosition = async () => {
  try {
    const position = await getCurrentPosition();
    return position
  } catch (error) {
    console.log(error);
  }
};

const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export {initMap, loadPosition}
