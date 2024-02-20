import * as React from 'react';
import * as mui from '@mui/material';



// Services
import { emit } from '@tauri-apps/api/event';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { session_and_local_auth } from '../../services/authentication/auth';
import { os } from '../../services/util/open';

// Alerts
import { ErrorAlert, SuccessAlert } from '../snackbars/alerts';

// Types
import { type AvailError } from '../../types/errors';

type ScanReAuthDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const ScanReAuthDialog: React.FC<ScanReAuthDialogProperties> = ({ isOpen, onRequestClose }) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleConfirmClick = () => {
		session_and_local_auth(password, navigate, setErrorAlert, setMessage, false).then(async () => {
			setMessage('Successfully authenticated.');
			setSuccess(true);
			// Wait for 0.8 seconds and fire onRequestClose
			await new Promise(r => setTimeout(r, 800));
			onRequestClose();

			emit('success_scan_reauth', {});
		}).catch(async (e) => {
			console.log(e);
			let error = e;

			const os_type = await os();
			if (os_type !== 'linux') {
				error = JSON.parse(e) as AvailError;
			}
			setMessage('Failed to authenticate, please try again.');
			setErrorAlert(true);
			onRequestClose();
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
				<mui.DialogTitle>{t('dialogs.reauth.title')}</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{ color: '#a3a3a3' }}>
						{t('dialogs.reauth.description')}
					</mui.DialogContentText>
					<mui.TextField
						autoFocus
						margin='dense'
						type='password'
						label='Password'
						fullWidth
						value={password}
						onChange={e => {
							setPassword(e.target.value);
						}}
						sx={{ mt: '8%', ...textFieldStyle }}
					/>
				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}>{t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}>{t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default ScanReAuthDialog;
