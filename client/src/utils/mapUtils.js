import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import config from '../config';
import {addMarkerToMap} from './mapboxUtils';

mapboxgl.accessToken = config.mapboxAPIKey;

const getVendors = async (geoLoc) => {
  return await axios.get(`/vendors?long=${geoLoc[0]}&lat=${geoLoc[1]}`)
}

const initMap = async (userLoc, mapContainer ) =>{
  let geoLoc;
  let map;

  // get current location
  let position = userLoc;
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

  // add GeoLocation Control
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
  }));
  return map
}

const addVendorsToMap = async(document, map, userLoc, handleDirectionClick) => {
  let position = userLoc;
  let geoLoc = [position.coords.longitude, position.coords.latitude];
  let res = await getVendors(geoLoc);
  let geojson = res.data;
  geojson.features.forEach(function (vendor,i) {
    let popupId = `popup-${i}`
    map = addMarkerToMap(document, map, vendor, popupId, handleDirectionClick) 
    return map;
  });
};

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

export {initMap, loadPosition, addVendorsToMap}
