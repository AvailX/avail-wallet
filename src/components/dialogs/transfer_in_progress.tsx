import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';

type TransferInProgressDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const TransferInProgressDialog: React.FC<TransferInProgressDialogProperties> = ({isOpen, onRequestClose}) => {
	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const {t} = useTranslation();

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
				<mui.DialogTitle>Trasfer is now in progress.</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{color: '#a3a3a3'}}>
						The zero knowledge proof is being generated and the transaction will being sent to the blockchain.
					</mui.DialogContentText>
				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> Close</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default TransferInProgressDialog;
