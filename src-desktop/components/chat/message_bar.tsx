import * as React from 'react';
import * as mui from '@mui/material';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';
import SendIcon from '@mui/icons-material/Send';
import {useNavigate} from 'react-router-dom';

const MessageBar = () => {
	const [isTyping, setIsTyping] = React.useState<boolean>(false);
	const [message, setMessage] = React.useState<string>('');

	const navigate = useNavigate();

	const handleIsTyping = () => {
		setIsTyping(true);
	};

	const handleInputBlur = () => {
		setIsTyping(false);
	};

	const handleSendMessage = () => {};

	return (
		<mui.Box sx={{
			width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: mui.alpha('#191818', 1), py: '5%',
			transform: isTyping ? 'translateY(-310px)' : 'translateY(0)', transition: 'transform 0.3s ease',
		}}>
			{!isTyping && (
				<mui.Box sx={{
					width: '90%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '5%',
				}}>
					<mui.Button
						variant='contained'
						autoCapitalize='false'
						sx={{
							backgroundColor: '#00FFAA', width: '25%', borderRadius: '30px', height: '40px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none',
						}}
						onClick={() => {}}
					>
						<mui.Typography sx={{fontSize: '1.1rem', color: '#000', fontWeight: 450}}>
                        Receive
						</mui.Typography>
					</mui.Button>
					<mui.Button
						variant='contained'
						autoCapitalize='false'
						sx={{
							backgroundColor: '#00FFAA', width: '25%', borderRadius: '30px', height: '40px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none',
						}}
						onClick={() => {
							navigate('/send');
						}}
					>
						<mui.Typography sx={{fontSize: '1.1rem', color: '#000', fontWeight: 450}}>
                        Send
						</mui.Typography>
					</mui.Button>
				</mui.Box>
			)}
			<mui.OutlinedInput
				placeholder='Type a message..'
				size='small'
				aria-label=''
				sx={{
					color: 'white',
					bgcolor: '#293343',
					width: '90%',
					borderRadius: 10,
					mt: '4%',
					height: '40px',
					pl: 1,
				}}
				fullWidth
				value={message}
				onChange={e => {
					setMessage(e.target.value);
				}}
				onFocus={handleIsTyping}
				onBlur={handleInputBlur}
				endAdornment={
					<mui.InputAdornment position='end'>
						{isTyping ? ( // Show the arrow icon when typing
							<mui.IconButton edge='end' onMouseDown={() => {
								setMessage(''); handleSendMessage();
							}} >
								<SendIcon sx={{color: '#fff'}} />
							</mui.IconButton>
						) : ( // Show the QR code icon when not typing
							<mui.IconButton edge='end'>
							</mui.IconButton>
						)}
					</mui.InputAdornment>
				}
				color='info'
			/>

		</mui.Box>
	);
};

export default MessageBar;
