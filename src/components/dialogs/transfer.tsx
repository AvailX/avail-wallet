import * as React from 'react';
import * as mui from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { emit } from '@tauri-apps/api/event';
import { os } from '../../services/util/open';
import { transfer } from '../../services/transfer/transfers';
import { ErrorAlert, SuccessAlert } from '../snackbars/alerts';
import { type TransferRequest } from '../../types/transfer_props/tokens';
import { type AvailError } from '../../types/errors';
import { useScan } from '../../context/ScanContext';
// Components
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type DeleteDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
	request: TransferRequest;
};

// This is used in case of auth session timeout
const TransferDialog: React.FC<DeleteDialogProperties> = ({ isOpen, onRequestClose, request }) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [passwordHidden, setPasswordHidden] = React.useState(true);


	// Scan states
	const { scanInProgress, startScan, endScan } = useScan();

	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleConfirmClick = () => {
		if (request.asset_id === 'ALEO') {
			request.asset_id = 'credits';
		}

		// Set the password in the request
		request.password = password;
		onRequestClose();

		sessionStorage.setItem('transferState', 'true');

		transfer(request, setErrorAlert, setMessage).then(() => {
			sessionStorage.setItem('transferState', 'false');
		}).catch(async error_ => {
			let error = error_;
			const osType = await os();
			if (osType !== 'linux') {
				error = JSON.parse(error_) as AvailError;
				console.log('Error' + error);
			}

			// Handle transfer off
			sessionStorage.setItem('transferState', 'false');
			await emit('transfer_off');

			console.log('Error' + error);
			setMessage('Failed to transfer, please try again.');
			setErrorAlert(true);
		});
	};

	const dialogStyle = {
		bgcolor: '#363636',
		color: 'white',
		borderRadius: '20px',
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
				<mui.DialogTitle>{t('dialogs.transfer.title')}</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{ color: '#B2B2B2' }}>
						{/* Enable translation here */}
						By confirming the transaction, you will be sending {request.amount / 1_000_000} {request.asset_id} to {request.recipient}.
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
					<mui.Button onClick={onRequestClose} sx={buttonStyle}>{t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}>{t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default TransferDialog;
