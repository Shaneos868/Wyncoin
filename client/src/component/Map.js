import React, { Component } from 'react';
import {initMap, loadPosition, addVendorsToMap} from '../utils/mapUtils';
import axios from 'axios';
import {Button} from 'semantic-ui-react';
import '../css/map.css';


export default class Map extends Component {
	constructor(){
		super();
		this.state={directionLoc:{}, instructions:false, map:{}, userLoc:null}
		this.mapStyle = {
			position: 'absolute',
			top: 0,
			bottom: 0,
			width: '100%'
		};
		this.handleDirectionClick = this.handleDirectionClick.bind(this);
		this.getVendors = this.getVendors.bind(this);
	}

	async componentDidMount() {
		let userLoc = await loadPosition();
		let map = await initMap(userLoc, this.mapContainer);
		let state = {...this.state}
		state.userLoc = userLoc;
		state.map = map;
		this.setState(state);
	}

	async getRoute(destLoc) {
		let userLoc = await loadPosition();
		let userLng = userLoc.coords.longitude;
		let userLat = userLoc.coords.latitude;
		let routeData;
		routeData = await axios.get(`/route?orig=${userLng},${userLat}&dest=${destLoc.lng},${destLoc.lat}`);
		return routeData;
	}

	async handleDirectionClick(destLoc){
		// console.log('direction req to', destLoc);
		let routeData = await this.getRoute(destLoc)
		return routeData;
	}

	toggleInstructions(){
		document.getElementById("instructions").className = "hidden";
	}

	async getVendors ()  {
	 await addVendorsToMap(document, this.state.map, this.state.userLoc, this.handleDirectionClick)	
	}

	render() {
		return (
			<div>
				<div id="mapContainer" style={{ position: "relative", }}>
					<div style={this.mapStyle} ref={el => this.mapContainer = el} />
				</div>
				<Button id="get-vendors" onClick={this.getVendors} color="black">Vendors/BTMs</Button>
				<div id='instructions' className="hidden">
					<Button onClick={this.toggleInstructions}>X</Button>
				</div>
			</div>
		)
	}
}