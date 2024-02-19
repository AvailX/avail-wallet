import * as React from 'react';
import * as mui from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {updateBackupFlag} from 'src/services/storage/persistent';
import {useNavigate} from 'react-router-dom';
import {session_and_local_auth} from 'src/services/authentication/auth';
import {useTranslation} from 'react-i18next';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';

type DisableBackupDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const DisableBackupDialog: React.FC<DisableBackupDialogProperties> = ({isOpen, onRequestClose}) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const {t} = useTranslation();

	const handleConfirmClick = () => {
		updateBackupFlag(true).then(() => {
			setMessage('Backup is now enabled');
			setSuccess(true);
			onRequestClose();
		}).catch(error => {
			console.log(error);
			setMessage('Problem when updating backup flag, apologies. Please try again.');
			setErrorAlert(true);
		});
	};

	const dialogStyle = {
		bgcolor: '#1E1D1D',
		color: 'white',
	};

	const textFieldStyle = {
		input: {color: 'white'},
		label: {color: 'gray'},
		'& label.Mui-focused': {color: '#00FFAA'},
		'& .MuiInput-underline:after': {borderBottomColor: '#00FFAA'},
		'& .MuiOutlinedInput-root': {
			'& fieldset': {borderColor: 'gray'},
			'&:hover fieldset': {borderColor: 'white'},
			'&.Mui-focused fieldset': {borderColor: '#00FFAA'},
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
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message}/>
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{sx: dialogStyle}}>
				<mui.DialogTitle> {t('dialogs.disable-backup.title')}</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{color: '#a3a3a3'}}>
						{t('dialogs.disable-backup.description')}
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
						sx={{mt: '8%', ...textFieldStyle}}
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

export default DisableBackupDialog;
