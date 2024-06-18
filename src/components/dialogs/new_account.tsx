import * as React from 'react';
import * as mui from '@mui/material';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';
import {delete_local_for_recovery} from '../../services/recovery/phrase';
import { delete_util , session_and_local_auth} from '../../services/authentication/auth';
import { getViewingKey } from '../../services/storage/keys';

type NewAccountDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const NewAccountDialog: React.FC<NewAccountDialogProperties> = ({isOpen, onRequestClose}) => {
	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [error, setError] = React.useState<boolean>(false);



	const navigate = useNavigate();
	const {t} = useTranslation();

	const handleConfirmClick = () => {
		console.log('Creating new account...');
		console.log('Deleting local data...');
		delete_local_for_recovery(password).then(() => {
			navigate('/register');
		}).catch(() => {
			setMessage('An error occurred while creating a new account. Please try again.');
			setErrorAlert(true);
		});
	};

	const dialogStyle = {
		bgcolor: '#1E1D1D',
		color: 'white',
	};

	const buttonStyle = {
		color: '#00FFAA',
		'&:hover': {
			bgcolor: 'rgba(0, 255, 170, 0.1)',
		},
	};

	return (
		<>
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setError} message={message} />
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message} />
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{ sx: dialogStyle }}>
				<mui.DialogTitle>New Account</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{ color: '#a3a3a3' }}>
                        Are you sure you want to create a new account? This will delete the current account and all its data.
					</mui.DialogContentText>

				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> Cancel </mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}> Confirm</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default NewAccountDialog;


