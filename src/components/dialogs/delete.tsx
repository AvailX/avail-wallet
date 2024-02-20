import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {delete_util} from '../../services/authentication/auth';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';

type DeleteDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const DeleteDialog: React.FC<DeleteDialogProperties> = ({isOpen, onRequestClose}) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const {t} = useTranslation();

	const handleConfirmClick = () => {
		delete_util(setSuccess, setErrorAlert, setMessage, navigate, password);
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
				<mui.DialogTitle>{t('dialogs.delete.title')}</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{color: '#a3a3a3'}}>
						{t('dialogs.delete.description')}
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
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> {t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}> {t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default DeleteDialog;
