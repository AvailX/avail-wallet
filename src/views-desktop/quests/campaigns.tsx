import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Layout from '../reusable/layout';
import SideMenu from '../../components/sidebar';
import CampaignView from '../../components/quests/campaign';
import greenGlow from '../../assets/images/backgrounds/gglow_quests.png';

// Typography
import { LargeTitleText } from '../../components/typography/typography';

// Testing
import { type Campaign, testCampaign } from '../../types/quests/quest_types';

// Services
import { createCampaign, getCampaigns } from '../../services/quests/quests';
import { invoke } from '@tauri-apps/api/core';

function Campaigns() {
	const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);

	React.useEffect(() => {
		getCampaigns().then(campaigns => {
			setCampaigns(campaigns);
		}).catch(err => {
			console.log(err);
		});
	}, []);

	const handleCreateCampaign = () => {
		console.log('Create Campaign Clicked');
		createCampaign(
			'New Campaign test',
			'New Campaign t',
			'New Campaign t 1',
			'New Campaign t Main',
			'New Campaign t 2',
			'New Campaign t Desc',
			'https://avail.global/_next/static/media/Avail-Logo-OnDark.3bbffcbf.svg',
			'https://avail.global/_next/static/media/Avail-Logo-OnDark.3bbffcbf.svg',
			'https://avail.global/_next/static/media/Avail-Logo-OnDark.3bbffcbf.svg',
			'000000',
			'https://avail.global/_next/static/media/Avail-Logo-OnDark.3bbffcbf.svg',
			'New Campaign Project t'
		).then(campaign => {
			console.log('Campaign Created:', campaign);
			setCampaigns([...campaigns, campaign]);
		}).catch(err => {
			console.log(err);
		});
	};

	return (
		<Layout>
			<SideMenu />
			<mui.Box sx={{ display: 'flex', flexDirection: 'column', p: '3%', justifyContent: 'center', alignItems: 'center', background: 'url(' + greenGlow + ') no-repeat ', paddingBottom: '7%' }}>
				<LargeTitleText sx={{ color: '#FFF' }}> Web3 Privacy</LargeTitleText>
				<LargeTitleText sx={{ color: '#00FFAA', textShadow: '0 0 10px #00FFAA' }}> Quests </LargeTitleText>
			</mui.Box>
			<mui.Button onClick={() => { handleCreateCampaign() }}> Create Campaign </mui.Button>
			<mui.Box sx={{ display: 'flex', flexDirection: 'column', mt: '3%' }}>
				{campaigns.map(campaign => (
					<CampaignView {...campaign} key={campaign.id} />
				))}
			</mui.Box>
		</Layout>
	);
}

export default Campaigns;

