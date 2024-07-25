import React from 'react';
import './dappLogo.css'; // Custom CSS for styling and animation
import {type Dapp} from '../../assets/dapps/dapps';

type AppLogosProps = {
	logos: Dapp[];
};

const DappLogos: React.FC<AppLogosProps> = ({logos}) => (
	<div className='logos-container'>
		{logos.map((logo, index) => (
			<img src={logo.img} alt={logo.name} className='app-logo' key={index} style={logo.style}/>
		))}
	</div>
);

export default DappLogos;
