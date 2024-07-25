import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Layout from './reusable/layout';
import MiniDrawer from '../components/sidebar';
import SearchBox from '../components/dApps/searchbar';
import DappLogos from '../components/dApps/dappLogo';
import DappView from '../components/dApps/dapp';
import {displayDapps, dapps} from '../assets/dapps/dapps';

// Images
import dappCollection from '../assets/dapps/dapp-collection.svg';
import greenGlow from '../assets/dapps/gglow.png';
import '../components/dApps/dappLogo.css';

// Typography
import {LargeTitleText, SubtitleText} from '../components/typography/typography';

import {useNavigate} from 'react-router-dom';

const Dapps = () => {
	const mdsx = mui.useMediaQuery('(min-width:850px)');
	const md = mui.useMediaQuery('(min-width:950px)');

	const navigate = useNavigate();

	return (
		<Layout>
			<MiniDrawer/>
			<mui.Box sx={{ml: md ? '7%' : '10%', width: md ? '93%' : '90%'}}>
				<mui.Box sx={{display: 'flex', flexDirection: 'row'}}>
					<mui.Box sx={{display: 'flex', flexDirection: 'column', mt: '8%', width: '40%'}}>
						<LargeTitleText sx={{color: '#FFF'}}> Your Gateway to <LargeTitleText sx={{color: '#00FFAA', textShadow: '0 0 5px #00FFAA'}}>Privacy.</LargeTitleText></LargeTitleText>
						<SubtitleText sx={{color: '#A3A3A3', mt: '4%'}}> Embark into Avail's Gateway to Privacy, unlock a treasure trove of dApps designed with your privacy at their core, nothing less. </SubtitleText>
						<SearchBox/>
					</mui.Box>
					<mui.Box sx={{
						display: 'flex', flexDirection: 'column', width: '60%',
						background: 'url(' + greenGlow + ') no-repeat ', paddingTop: '7%', paddingBottom: '20%', backgroundSize: 'cover',
					}}>
						<img src={dappCollection} alt={'dappCollection'} className='app-logo' style={{width: mdsx ? '85%' : '75%', height: 'auto', alignSelf: 'flex-end'}} draggable={false}/>
					</mui.Box>
				</mui.Box>
				<mui.Grid container spacing={2} sx={{marginTop: '20px', alignItems: 'center', mb: '5%', paddingLeft: '2%'}}>
					{dapps.map((dapp, index) => (
						<mui.Grid item xs={6} md={md ? 4 : 6} key={index}>
							<DappView dapp={dapp} onClick={() => {
								navigate('/browser', {state: dapp.url});
							}} />
						</mui.Grid>
					))}
				</mui.Grid>
			</mui.Box>
		</Layout>
	);
};

export default Dapps;
