import * as React from 'react';
import * as mui from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { delete_util } from '../../services/authentication/auth';
import { ErrorAlert, SuccessAlert } from '../snackbars/alerts';
// Components
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import STButton from '../buttons/settings-button';
import { SubtitleText, BodyText } from '../typography/typography';
import dappPrivacySettings_init from '../../assets/dapps/dapp-home/dappPrivacySettings-init.png';


type dappPrivacySettingsDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
};

const DappPrivacySettingsDialog: React.FC<dappPrivacySettingsDialogProperties> = ({ isOpen, onRequestClose }) => {
	const [password, setPassword] = React.useState('');

	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [passwordHidden, setPasswordHidden] = React.useState(true);

	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleConfirmClick = () => {
		delete_util(setSuccess, setErrorAlert, setMessage, navigate, password);
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

    const imageStyle = {
        container: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Adjust as needed to center vertically
        },
        image: {
          maxWidth: '193px', // Adjust the maximum width of the image
          maxHeight: '193px', // Adjust the maximum height of the image
          width: 'auto',
          height: 'auto',
        },
      };


	return (
		<>
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message} />
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message} />
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{ sx: dialogStyle }}>
                <img src={dappPrivacySettings_init} alt="a finger pointing at, almost touching, a neon green luminescent lock set against a black background" />

				<mui.DialogTitle>{"Dialogue Title"}</mui.DialogTitle>
				<mui.DialogContent>
                    
					<mui.DialogContentText sx={{ color: '#a3a3a3' }}>
						{t('dialogs.delete.description')}
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
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> {t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}> {t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default DappPrivacySettingsDialog;
