import * as React from 'react';
import * as mui from '@mui/material';

// Types
import { type Task, type Quest, campaign } from 'src/types/quests/quest_types';
import greenGlow from '../../assets/dapps/gglow.png';

// Components
import TaskBox from './task';
import Close from '@mui/icons-material/Close';
import { SubMainTitleText, SubtitleText } from '../typography/typography';

// Services
import { fetchQuestMetrics, isQuestCompleted } from '../../services/quests/quests';
import { get_address } from '../../services/storage/persistent';
import InfoTooltip from '../tooltips/info';

export type TaskDrawerProps = {
	open: boolean;
	onClose: () => void;
	quest: Quest;
};

const TaskDrawer: React.FC<TaskDrawerProps> = ({ open, onClose, quest }) => {
	const [questCompleted, setQuestCompleted] = React.useState(false);
	const [metrics, setMetrics] = React.useState(0);

	React.useEffect(() => {
		isQuestCompleted(quest?.id).then(res => {
			if (res) {
				setQuestCompleted(true);
			}
		}).catch(err => {
			console.log(err);
		});
	}, [quest]);
	React.useEffect(() => {
		const fetchMetrics = async () => {
			try {
				console.log('Quest:', quest);
				console.log('Quest ID:', quest?.id);
				const metrics = await fetchQuestMetrics(quest.id);
				setMetrics(Number(metrics));
				console.log('Metrics:', Number(metrics));
			} catch (error) {
				console.error("Error fetching metrics:", error);
			}
		};

		fetchMetrics();
	}, [quest]);


	return (
		<mui.Drawer
			anchor='bottom'
			open={open}
			onClose={onClose}
			sx={{
				'& .MuiDrawer-paper': {
					borderTopLeftRadius: '20px',
					borderTopRightRadius: '20px',
					height: '95%', // Drawer height
					backgroundImage: `linear-gradient(to right, transparent 100%, #171717 0%),url(${greenGlow})`,
					backgroundSize: 'cover',
					bgcolor: '#171717',
					width: '90%',
					alignSelf: 'center',
					ml: '7.5%',
				},
				alignSelf: 'center',
			}}
		>
			{/* Close button */}
			<mui.Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<mui.IconButton onClick={onClose}>
					<Close sx={{ color: '#a3a3a3' }} />
				</mui.IconButton>
			</mui.Box>
			<mui.Box sx={{ display: 'flex', flexDirection: 'column', borderRadius: '20px', background: 'linear-gradient(135deg, #171717 10%, #0C6446 90%)', alignSelf: 'flex-end', width: '20%', pl: 2, pt: 1, pb: 1 }}>
				<mui.Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
					<SubtitleText sx={{ color: '#B2B2B2' }}>Metrics</SubtitleText>
				</mui.Box>
				<SubtitleText sx={{ color: '#B2B2B2' }}>{metrics}</SubtitleText>

			</mui.Box>
			<SubMainTitleText sx={{ color: '#fff', ml: '5%' }}>Tasks</SubMainTitleText>

			{/* Quest title */}

			{quest?.tasks?.map(task => (
				<TaskBox key={task.id} task={task} quest={quest} questCompleted={questCompleted} />
			))}

		</mui.Drawer>
	);
};

export default TaskDrawer;

