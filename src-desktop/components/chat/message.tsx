import * as React from 'react';
import * as mui from '@mui/material';

// Types
import {type Message} from '../../types/chat/messages';

type MessageProperties = {
	message: Message;
	sent: boolean;
};

const MessageItem: React.FC<MessageProperties> = ({message, sent}) => (
	<mui.Paper
		sx={{
			p: 1.5,
			backdropFilter: 'blur',
			backgroundColor: sent ? '#00FFAA' : '#6F677A',
			marginTop: 1,
		}}
	>
		<mui.Typography
			variant='body1'
			sx={{color: sent ? '#000' : '#fff', fontSize: '1.1rem'}}
		>
			{message.content}
		</mui.Typography>
	</mui.Paper>
);

export default MessageItem;
