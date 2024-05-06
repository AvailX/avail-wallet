import * as React from 'react';
import * as mui from '@mui/material';

// Types
import {type Task, type Quest} from 'src/types/quests/quest_types';
import greenGlow from '../../assets/dapps/gglow.png';

// Components
import TaskBox from './task';
import Close from '@mui/icons-material/Close';
import {SubMainTitleText} from '../typography/typography';

// Services
import {isQuestCompleted} from '../../services/quests/quests';

export type TaskDrawerProps = {
	open: boolean;
	onClose: () => void;
	quest: Quest;
};

const TaskDrawer: React.FC<TaskDrawerProps> = ({open, onClose, quest}) => {
	const [questCompleted, setQuestCompleted] = React.useState(false);

	React.useEffect(() => {
		isQuestCompleted(quest.id).then(res => {
			if (res) {
				setQuestCompleted(true);
			}
		}).catch(err => {
			console.log(err);
		});
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
			<mui.Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
				<mui.IconButton onClick={onClose}>
					<Close sx={{color: '#a3a3a3'}} />
				</mui.IconButton>
			</mui.Box>

			<SubMainTitleText sx={{color: '#fff', ml: '5%'}}>Tasks</SubMainTitleText>

			{/* Quest title */}
			{quest.tasks.map(task => (
				<TaskBox key={task.id} task={task} quest={quest} questCompleted={questCompleted} />
			))}

		</mui.Drawer>
	);
};

export default TaskDrawer;

