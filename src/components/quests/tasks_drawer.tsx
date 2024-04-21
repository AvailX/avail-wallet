import * as React from 'react';
import * as mui from '@mui/material';

// Types
import {type Task, type Quest} from 'src/types/quests/quest_types';

// Components
import TaskBox from './task';
import Close from '@mui/icons-material/Close';

export type TaskDrawerProps = {
	open: boolean;
	onClose: () => void;
	quest: Quest;
	questCompleted: boolean;
};

const TaskDrawer: React.FC<TaskDrawerProps> = ({open, onClose, quest, questCompleted}) => (
	<mui.Drawer
		anchor='bottom'
		open={open}
		onClose={onClose}
		sx={{
			'& .MuiDrawer-paper': {
				borderTopLeftRadius: '20px',
				borderTopRightRadius: '20px',
				height: '85%', // Drawer height
				overflow: 'hidden', // Prevent scrolling on the entire drawer
				bgcolor: '#1E1D1D',
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
		{quest.tasks.map(task => (
			<TaskBox key={task.id} task={task} quest={quest} questCompleted={questCompleted} />
		))}
	</mui.Drawer>
);

export default TaskDrawer;

