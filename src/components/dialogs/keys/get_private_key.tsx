import * as React from 'react';
import * as mui from '@mui/material';
import { getPrivateKey } from '../../../services/storage/keys';
import { ErrorAlert, SuccessAlert } from '../../snackbars/alerts';

// Components
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type PkDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
	setPrivateKey: (key: string) => void;
};

const PrivateKeyDialog: React.FC<PkDialogProperties> = ({ isOpen, onRequestClose, setPrivateKey }) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [passwordHidden, setPasswordHidden] = React.useState(true);

	const handleConfirmClick = () => {
		getPrivateKey(password).then(res => {
			setPrivateKey(res);
			onRequestClose();
		}).catch(error => {
			console.log(error);
			setMessage('Error getting Viewing Key. Please try again.');
			setErrorAlert(true);
		});
	};

	const dialogStyle = {
		bgcolor: '#1E1D1D',
		color: 'white',
	};

	const textFieldStyle = {
		input: { color: 'white' },
		label: { color: 'gray' },
		'& label.Mui-focused': { color: '#00FFAA' },
		'& .MuiInput-underline:after': { borderBottomColor: '#00FFAA' },
		'& .MuiOutlinedInput-root': {
			'& fieldset': { borderColor: 'gray' },
			'&:hover fieldset': { borderColor: 'white' },
			'&.Mui-focused fieldset': { borderColor: '#00FFAA' },
		},
	};

	const buttonStyle = {
		color: '#00FFAA',
		'&:hover': {
			bgcolor: 'rgba(0, 255, 170, 0.1)',
		},
	};

	return (
		<>
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message} />
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message} />
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{ sx: dialogStyle }}>
				<mui.DialogTitle>Do you want to get your Private Key ?</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{ color: '#a3a3a3' }}>
						This action will decrypt your Private Key and display it on the screen. Enter your password to continue.
					</mui.DialogContentText>
					<mui.TextField
						autoFocus
						margin='dense'
						type={passwordHidden ? 'password' : ''}
						label='Password'
						fullWidth
						value={password}
						onChange={e => {
							setPassword(e.target.value);
						}}
						sx={{ mt: '8%', ...textFieldStyle }}
						InputProps={{
							endAdornment: (
								<mui.InputAdornment position='end'>
									{passwordHidden ? <VisibilityOffIcon style={{ color: '#FFF', cursor: 'pointer' }} onClick={() => {
										setPasswordHidden(false);
									}} /> : <VisibilityIcon style={{ color: '#FFF' }} onClick={() => {
										setPasswordHidden(true);
									}} />}
								</mui.InputAdornment>
							),
						}}
					/>
				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}>Cancel</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}>Confirm</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default PrivateKeyDialog;
