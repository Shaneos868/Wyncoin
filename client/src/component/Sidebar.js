import React, { Component } from 'react'
import axios from 'axios';
import Map from './Map';
import {addVendorsToMap} from '../utils/mapUtils';
import { Sidebar, Segment, Button, Menu, Icon } from 'semantic-ui-react';
import '../css/sidebar.css';

class SidebarLeftUncover extends Component {
	constructor(){
		super()
		this.state = { visible: false, price: ''}
		this.priceTicker();
	}

	toggleVisibility = () => this.setState({ visible: !this.state.visible })

	priceTicker =  async () => {
		let {data} = await axios.get('https://blockchain.info/ticker');
		let price = Number(data.USD.sell)
			.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});
		this.setState({price});
		setInterval(async()=>{
			let {data} = await axios.get('https://blockchain.info/ticker');
			let price = Number(data.USD.sell)
				.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});
			this.setState({price});
		}, 30000);
	}


	render() {
		const { visible } = this.state
		return (
			<div className="map-body">
				<Sidebar.Pushable as={Segment}>
					<Button id="sidebar-toggle" onClick={this.toggleVisibility} color="black">Menu</Button>
					<Sidebar
						as={Menu}
						animation='uncover'
						width='thin'
						visible={visible}
						icon='labeled'
						vertical
						inverted
					>
						<Menu.Item name='price'>
							BTC: {this.state.price}
						</Menu.Item>
						<Menu.Item name='home'>
							<Icon name='home' />
							Home
            </Menu.Item>
						<Menu.Item name='user'>
							<Icon name='user' />
							Profile
            </Menu.Item>
						<Menu.Item name='bell'>
							<Icon name='bell' />
							Alerts
            </Menu.Item>
						<Menu.Item name='signout'>
							Sign Out
            </Menu.Item>
					</Sidebar>
					<Sidebar.Pusher>
						<Segment basic>
							<Map />
						</Segment>
					</Sidebar.Pusher>
				</Sidebar.Pushable>
			</div>
		)
	}
}

export default SidebarLeftUncover