import React from 'react';
import * as mui from '@mui/material';

// Types
import {type Quest} from '../../types/quests/quest_types';

// Typography
import {SubMainTitleText} from '../typography/typography';

// Services
import {isTaskCompleted} from '../../services/quests/quests';
import {formatDate} from '../events/event';

// Components
import TaskDrawer from './tasks_drawer';

// Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type QuestBoxProps = {
	quest: Quest;
	openTasks: boolean;
	setOpenTasks: (value: boolean) => void;
	setQuest: (value: Quest) => void;
};

const QuestBox: React.FC<QuestBoxProps> = ({quest, openTasks, setOpenTasks, setQuest}) => {
	const [completed, setCompleted] = React.useState(false);
	/*
	React.useEffect(() => {
		isTaskCompleted(quest.id).then(res => {
			if (res) {
				setCompleted(true);
			}
		}).catch(err => {
			console.log(err);
		});
	}, []);
	*/

	return (
		<mui.Box sx={{
			width: '450px',
			backgroundImage: `linear-gradient(to right, #000 40%, transparent 60%),url(${quest.display_image})`,
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			borderRadius: 5,
			padding: '20px',
			height: '250px',
			border: '1px solid #404040',
			mt: '2%',
			cursor: 'pointer',
			transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out',
			'&:hover': {
				transform: 'translateY(-5px)',
				boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
			},
		}}
		onClick={() => {
			setQuest(quest);
			setOpenTasks(true);
		}}
		>
			<SubMainTitleText color='#FFF'>{quest.title}</SubMainTitleText>
			<mui.Typography variant='body1' color='#fff' sx={{mb: '20%'}}>{quest.description}</mui.Typography>
			{ quest.reward.method.toString() === 'LuckyDraw' ? (
				<mui.Box sx={{display: 'flex', flexDirection: 'column'}}>
					<mui.Typography variant='h4' color='#FFF'> Chance to Win {quest.reward.collection_name} Whitelist</mui.Typography>
					<mui.Typography variant='body1' color='#00FFAA'> Allocation {quest.reward.amount} </mui.Typography>
				</mui.Box>
			)
				: quest.reward.method.toString() === 'FCFS' ? (
					<mui.Box sx={{display: 'flex', flexDirection: 'column'}}>
						<mui.Typography variant='h4' color='#FFF'> First {quest.reward.amount} to complete.</mui.Typography>
						<mui.Typography variant='body1' color='#00FFAA'> Gets {quest.reward.collection_name} Whitelist </mui.Typography>
					</mui.Box>
				)
					: (
						<mui.Typography variant='body1' color='#A3A3A3'>Leaderboard: {quest.reward.amount} {quest.reward.collection_name}</mui.Typography>
					)
			}
			{completed ? (
				<CheckCircleIcon sx={{color: '#00FFAA', width: '35px', height: '35px'}}/>
			) : (
				<mui.Typography variant='body1' color='#A3A3A3' sx={{mt: '2%'}}>Expires on: {quest.expires_on.toString()}</mui.Typography>
			)}
		</mui.Box>);
};

export default QuestBox;
