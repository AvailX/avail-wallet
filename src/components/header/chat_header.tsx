import * as mui from '@mui/material';
import * as React from 'react';
import BackButton from '../buttons/back';
import '../../styles/shapes.css';

type ChatHeaderProperties = {
	name: string;
};

const ChatHeader: React.FC<ChatHeaderProperties> = ({name}) => (
	<mui.Box
		sx={{
			display: 'flex',
			flexDirection: 'row',
			width: '100%',
			alignSelf: 'center',
			justifyContent: 'space-between',
			alignItems: 'center',
		}}
	>
		<BackButton />

		<mui.Typography sx={{color: '#00FFAA', fontSize: '1.1rem'}}>
			{name}
		</mui.Typography>

		<mui.Box sx={{width: '15%'}} >
			<mui.Box className='hex2' >
				<mui.Typography sx={{color: '#000', fontSize: '1.1rem'}}>
					{name.charAt(0).toUpperCase()}
				</mui.Typography>
			</mui.Box>
		</mui.Box>
	</mui.Box>
);

export default ChatHeader;
