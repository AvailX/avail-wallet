import * as mui from '@mui/material';
import * as React from 'react';

// Types
import {type Room} from '../../types/chat/room';
import {type LastMessage} from '../../types/chat/messages';

type RoomProperties = {
	room: Room;
	username: string | undefined;
	address: string | undefined;
};

const RoomItem: React.FC<RoomProperties> = ({room, username, address}) => {
	const [name, setName] = React.useState<string>('');
	const [initial, setInitial] = React.useState<string>('');
	const [last_message, setLastMessage] = React.useState<LastMessage>({
		content: 'Yo what\'s up',
		sender: 'Kyle',
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
	});
	const [date, setDate] = React.useState<string>('');
	const [seen, setSeen] = React.useState<boolean>(false);

	function handleName() {
		if (room.participants.length === 2) {
			for (const participant of room.participants) {
				if (participant.username !== username && participant.username !== undefined) {
					setName(participant.username);
					setInitial(participant.username.charAt(0).toUpperCase());
				} else if (participant.username !== username && participant.username == undefined) {
					setName(participant.id);
					setInitial(participant.id.charAt(0).toUpperCase());
				}
			}
		} else {
			setName(room.name);
			setInitial(room.name.charAt(0).toUpperCase());
		}
	}

	function decryptMessage() {
		// TODO: decrypt message
		// TODO: handle date format
		setLastMessage({
			content: 'Yo what\'s up',
			sender: 'Kyle',
			created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
		});
	}

	function handleSeen() {
		for (const participant of room.participants) {
			if (participant.id !== address) {
				participant.seen ? setSeen(true) : setSeen(false);
			}
		}
	}

	function formatDateBasedOnCriteria(inputDate: Date): string {
		const currentDate = new Date();
		const dateDiff = Math.floor((currentDate.getTime() - inputDate.getTime()) / (1000 * 3600 * 24));

		if (dateDiff === 0) {
			// Same day
			const hours = inputDate.getHours();
			const minutes = inputDate.getMinutes();
			const ampm = hours >= 12 ? 'PM' : 'AM';
			const formattedHours = hours % 12 || 12;
			const formattedMinutes = minutes.toString().padStart(2, '0');
			return `${formattedHours}:${formattedMinutes}${ampm}`;
		}

		if (dateDiff === 1) {
			// Yesterday
			return 'Yesterday';
		}

		if (dateDiff < 7) {
			// Within the same week
			const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			const dayOfWeek = days[inputDate.getDay()];
			return dayOfWeek;
		}

		// Before the current week
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const month = monthNames[inputDate.getMonth()];
		const day = inputDate.getDate();
		return `${day} ${month}`;
	}

	React.useEffect(() => {
		handleName();
		handleSeen();
		decryptMessage();
		setDate(formatDateBasedOnCriteria(last_message.created_at));
	}, []);

	return (
		<mui.Box sx={{
			display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', mt: '4%',
		}}>
			<mui.Box sx={{
				display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center',
			}}>
				{ /* if last_message unseen then #00FFAA if seen then #273344  */}
				<mui.Avatar sx={{
					bgcolor: seen ? '#00ffaa' : '#273344', width: '45px', height: '45px', color: seen ? '#273344' : '#00ffaa',
				}}>{initial}</mui.Avatar>
				<mui.Box sx={{display: 'flex', flexDirection: 'column', width: '100px'}}>
					<mui.Typography sx={{color: seen ? '#00FFAA' : '#FFF'}}>
						{seen ? (name + ' •') : name}
					</mui.Typography>
					<mui.Typography sx={{color: seen ? '#00FFAA' : '#a3a3a3'}}>
						{last_message.content}
					</mui.Typography>
				</mui.Box>
			</mui.Box>
			<mui.Typography sx={{color: seen ? '#00FFAA' : '#FFF'}}>
				{date}
			</mui.Typography>
		</mui.Box>
	);
};

export default RoomItem;
