import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Layout from '../reusable/layout';
import SideMenu from '../../components/sidebar';
import QuestBox from '../../components/quests/quest';
import TaskDrawer from '../../components/quests/tasks_drawer';

// Types
import {type CampaignDetailPageProps} from '../../types/quests/quest_types';
import {type Quest} from '../../types/quests/quest_types';

// Images
import verified from '../../assets/icons/verified.svg';

// Typography
import {BodyText500} from '../../components/typography/typography';

import {useLocation} from 'react-router-dom';

const Quests: React.FC = () => {
	const {campaign, quests} = useLocation().state as CampaignDetailPageProps;
	const [quest, setQuest] = React.useState<Quest>(quests[0]);
	const [openTasks, setOpenTasks] = React.useState(false);

	const mdsx = mui.useMediaQuery('(min-width:850px)');
	const md = mui.useMediaQuery('(min-width:950px)');
	const mdlg = mui.useMediaQuery('(min-width:1150px)');
	const lgsx = mui.useMediaQuery('(min-width:1550px)');
	const lg = mui.useMediaQuery('(min-width:1750px)');
	const lgxl = mui.useMediaQuery('(min-width:1950px)');

	return (
		<Layout>
			<SideMenu/>
			<TaskDrawer open={openTasks} onClose={() => {setOpenTasks(false)}} quest={quest} questCompleted={false}/>
			<mui.Box sx={{ml: md ? '5%' : '7%', display: 'flex', flexDirection: 'column', width: md ? '95%' : '93%'}}>
				<mui.Box sx={{background: `url(${campaign.bg_image})`, color: campaign.color, backgroundPosition: lgxl ? 'center' : 'bottom', height: lgxl ? '380px' : '320px', backgroundSize: 'cover'}}>
					<mui.Box sx={{borderRadius: '100%', border: '1px solid #696969', p: 1.5, width: '200px', mt: lgxl ? '10%' : lg ? '8%' : lgsx ? '10%' : mdlg ? '10%' : md ? '13%' : mdsx ? '14%' : '17%', ml: '5%' }}>
						<mui.Box
							component='img'
							src={campaign.profile_image}
							sx={{borderRadius: 0, maxWidth: '100%'}}
						/>
					</mui.Box>
					<mui.Box
						component='img'
						src={verified}
						sx={{borderRadius: 0, ml: lgxl ? '11%' : lg ? '13%' : lgsx ? '15%' : mdlg ? '17%' : md ? '20%' : '23%', mt: lg ? '-8%' : lgsx ? '-10%' : '-12%'}}
					/>
				</mui.Box>
				<mui.Box sx={{ml: '2%', mt: '5%'}}>
					<mui.Typography variant='h3' color='#FFF'>{campaign.title}</mui.Typography>
					<BodyText500 color='#A3A3A3'>{campaign.inner_description}</BodyText500>
				</mui.Box>
				<mui.Divider sx={{width: '100%', height: '1px', bgcolor: '#00FFAA', mt: '3%'}} orientation='horizontal'/>
				<mui.Grid container spacing={2} sx={{marginTop: '20px', alignItems: 'center', mb: '5%', paddingLeft: '2%', bgcolor: '#111111', alignSelf: 'center', width: '100%', justifyContent: 'space-around'}}>
					{quests.map(quest => (
						<QuestBox key={quest.id} quest={quest} openTasks={openTasks} setOpenTasks={setOpenTasks} setQuest={setQuest}/>
					))}
				</mui.Grid>
			</mui.Box>
		</Layout>
	);
};

export default Quests;

