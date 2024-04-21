import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Layout from '../reusable/layout';
import SideMenu from '../../components/sidebar';
import CampaignView from '../../components/quests/campaign';
import greenGlow from '../../assets/images/backgrounds/gglow_quests.png';

// Typography
import {LargeTitleText} from '../../components/typography/typography';

// Testing
import {testCampaign} from '../../types/quests/quest_types';

function Campaigns() {
	return (
		<Layout>
			<SideMenu />
			<mui.Box sx={{display: 'flex', flexDirection: 'column', p: '3%', justifyContent: 'center', alignItems: 'center', background: 'url(' + greenGlow + ') no-repeat ', paddingBottom: '7%'}}>
				<LargeTitleText sx={{color: '#FFF'}}> Web3 Privacy</LargeTitleText>
				<LargeTitleText sx={{color: '#00FFAA', textShadow: '0 0 10px #00FFAA'}}> Quests </LargeTitleText>
			</mui.Box>
			<mui.Box sx={{display: 'flex', flexDirection: 'column', mt: '3%'}}>
				{testCampaign.map(campaign => (
					<CampaignView {...campaign} key={campaign.id} />
				))}
			</mui.Box>
		</Layout>
	);
}

export default Campaigns;

