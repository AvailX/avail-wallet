import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Divider from '@mui/material/Divider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForward from '@mui/icons-material/ArrowForward';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import SimpleAvAppBar from '../components/header/simple_appbar';
import CTAButton from '../components/buttons/cta';
import WhiteHueTextField from '../components/textfields/white-hue';
import SecureButton from '../components/buttons/secure-button';
import LanguageSelector from '../components/select/language';

// Mui Date Components
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

// Images
import full_logo from '../assets/logo/full-logo.svg';

// Services
import {checkBiometrics} from '../services/authentication/register';
import {recover} from '../services/recovery/phrase';

// Typography
import {
	Title2Text, SubtitleText, BodyText, SubMainTitleText,
} from '../components/typography/typography';

// Icons

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Alerts
import {SuccessAlert, ErrorAlert,InfoAlert} from '../components/snackbars/alerts';

// Hooks
import {Languages} from '../types/languages';
import Layout from './reusable/layout';

const Recovery = () => {
	const md = mui.useMediaQuery('(min-width:1000px)');
	const lg = mui.useMediaQuery('(min-width:1200px)');

	const [password, setPassword] = React.useState<string>('');
	const [passwordHidden, setPasswordHidden] = React.useState<boolean>(true);
	const [confirmPassword, setConfirmPassword] = React.useState<string>('');
	const [confirmPasswordHidden, setConfirmPasswordHidden] = React.useState<boolean>(true);
	const [dateVal, setDateVal] = React.useState<Dayjs | null>(null);


	const [isSecureAccountVisible, setIsSecureAccountVisible] = React.useState(false);
	const [chooseDate,setChooseDate] = React.useState(false);

	const [passwordError, setPasswordError] = React.useState<string>('');
	const [confirmPasswordError, setConfirmPasswordError] = React.useState<string>('');

	const [error, setError] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const [info, setInfo] = React.useState(false);
	const [seedNotice,setSeedNotice] = React.useState(true);
	const [dateNotice,setDateNotice] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const {t} = useTranslation();

	const [isLoading, setIsLoading] = React.useState(false);
	// BiometricAvail is to check if user can use biometrics
	const [biometricAvail, setBiometricAvail] = React.useState<boolean>(false);
	const [biometric, setBiometric] = React.useState<boolean>(false);
	const [seed, setSeed] = React.useState<string>('');
	const [language, setLanguage] = React.useState<Languages>(Languages.English);

	const navigate = useNavigate();

	const handleOrdering = () => {
		//check if seed is 12 || 15 || 18 || 21 || 24 words
		if (seed.split(' ').length === 12 || seed.split(' ').length === 15 || seed.split(' ').length === 18 || seed.split(' ').length === 21 || seed.split(' ').length === 24) {
			setIsSecureAccountVisible(true);
			setSeedNotice(false);
		} else {
			setSeedNotice(false);
			setMessage('Invalid Seed Phrase');
			setError(true);

			setTimeout(() => {
				setSeedNotice(true);
			}, 5500);
		}

		{/*
		// Simulate loading with a timeout
		setTimeout(() => {
			setIsLoading(false); // Hide loading indicator
			setIsSecureAccountVisible(true);
			setSeedNotice(false);
			setDateNotice(true);
		}, 1500); // You can adjust the timeout duration
		*/}
	};

	function validatePassword(password: string): string {
		if (password.length < 12) {
			return t('signup.messages.errors.passwordLength');
		}

		if (!/[A-Z]/.test(password)) {
			return t('signup.messages.errors.passwordCapital');
		}

		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return t('signup.messages.errors.passwordSpecial');
		}

		return '';
	}

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newPassword = event.target.value;
		setPassword(newPassword);
		setPasswordError(validatePassword(newPassword));
	};

	const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newConfirmPassword = event.target.value;
		setConfirmPassword(newConfirmPassword);

		// You might also want to check if the passwords match here, or do it separately.
		if (newConfirmPassword === password) {
			setConfirmPasswordError(validatePassword(newConfirmPassword));
		} else {
			setConfirmPasswordError(t('signup.messages.errors.passwordMismatch'));
		}
	};

	return (
		<Layout>
			<InfoAlert infoAlert={info} setInfoAlert={setInfo} message={message}/>
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
			<ErrorAlert errorAlert={error} setErrorAlert={setError} message={message}/>

			{/*-- Seed Info Notice --*/}
			<mui.Snackbar open={seedNotice}  anchorOrigin={{vertical: 'top', horizontal: 'center'}} sx={{width:'60%'}}>
			<div>
			<mui.Alert severity='info'>
			Notice: Secret phrases from other wallets might not work and generate a different account. Use the import page to import accounts from other wallets :)
			</mui.Alert>
			</div>
			</mui.Snackbar>

			{/*-- Date Info Notice --*/}
			<mui.Snackbar open={dateNotice}  anchorOrigin={{vertical: 'top', horizontal: 'center'}} sx={{width:'60%'}}>
			<div>
			<mui.Alert severity='info'>
			Notice: If you want to start from a specific date, you can set the date here. Otherwise, you can just press continue and the wallet will scan the entire blockchain for your transactions and records.
			</mui.Alert>
			</div>
			</mui.Snackbar>

			{!isSecureAccountVisible && (
				<>
					<img src={a_logo} alt='aleo logo' style={{
						width: '60px', height: '60px', marginTop: '20px', marginLeft: '20px', cursor: 'pointer',
					}} onClick={() => {
						window.history.back();
					}}/>
					<mui.Box sx={{ position: 'absolute', top: 0, right: 0, margin: 2 }}>

					</mui.Box>

					<WhiteHueTextField
						placeholder='Input your secret recovery phrase..'
						value={seed}
						onChange={e => {
							setSeed(e.target.value);
						}}
						sx={{
							width: '70%', alignSelf: 'center', padding: '5%', mt: '10%', mb: '10%',
						}}
						InputProps={{sx: {height: '100px', fontSize: '1.3rem', wordWrap: 'break-word'}}}
					/>

					<CTAButton text={t('recover.recover')} onClick={() => {
						handleOrdering();
					}} width='25%' />
				</>
			)}

			{/* --Date Time Picker--
			{isSecureAccountVisible && !chooseDate &&
			<mui.Box
			sx={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				height: '90%',
				backgroundColor: 'transparent',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				transition: 'bottom 0.5s ease-in-out',
				borderRadius: '40px 40px 0 0',
			}}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
			<DatePicker value={dateVal} onChange={(newValue) => setDateVal(newValue)} sx={{ bgcolor: mui.alpha('#fff', 0.8), borderRadius: '20px',mt:'20%',mb:'15%',width:'50%','& .MuiOutlinedInput-root': {'&.Mui-focused fieldset':{borderColor:'transparent'}}}} />
			</LocalizationProvider>
			<SecureButton onClick={() => {
						setChooseDate(true);
						setDateNotice(false);
					}} sx={{width:'30%'}}>
			 Continue
			</SecureButton>
			</mui.Box>
			}
			*/}

			{/* --Account Details-- */}
			{isSecureAccountVisible && (
				<mui.Box
					sx={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						height: '90%',
						backgroundColor: 'transparent',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						transition: 'bottom 0.5s ease-in-out',
						borderRadius: '40px 40px 0 0',
					}}
				>
					<mui.Box sx={{
						display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center',
					}}>
						<mui.Box sx={{width: '15%'}}/>
						<Title2Text sx={{color: '#00FFAA', mt: '10%'}}>Secure your Account</Title2Text >
						<LanguageSelector language={language} setLanguage={setLanguage}/>
					</mui.Box>
					<WhiteHueTextField
						id='password'
						label='Password'
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							handlePasswordChange(event);
						}}
						value={password}
						type= {passwordHidden ? 'password' : ''}
						inputProps={{style: {color: '#fff'}}}
						InputLabelProps={{style: {color: '#fff'}}}
						sx={{width: md ? '55%' : '65%', marginTop: md ? '6%' : '3%'}}
						InputProps={{
							endAdornment: (
								<mui.InputAdornment position='end'>
									{passwordHidden ? <VisibilityOffIcon style={{color: '#FFF', cursor: 'pointer'}} onClick={() => {
										setPasswordHidden(false);
									}} /> : <VisibilityIcon style={{color: '#FFF'}} onClick={() => {
										setPasswordHidden(true);
									}} />}
								</mui.InputAdornment>
							),
						}}
						error={Boolean(passwordError)}
						helperText={passwordError}
					/>

					<WhiteHueTextField
						id='confirmPassword'
						label='Confirm Password'
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							handleConfirmPasswordChange(event);
						}}
						value={confirmPassword}
						color='primary'
						type= {confirmPasswordHidden ? 'password' : ''}
						inputProps={{style: {color: '#fff'}}}
						InputLabelProps={{style: {color: '#fff'}}}
						sx={{width: md ? '55%' : '65%', marginTop: md ? '2%' : '3%'}}
						InputProps={{
							endAdornment: (
								<mui.InputAdornment position='end'>
									{confirmPasswordHidden ? <VisibilityOffIcon style={{color: '#FFF', cursor: 'pointer'}} onClick={() => {
										setConfirmPasswordHidden(false);
									}} /> : <VisibilityIcon style={{color: '#FFF'}} onClick={() => {
										setConfirmPasswordHidden(true);
									}} />}
								</mui.InputAdornment>
							),
						}}
						error={Boolean(confirmPasswordError)}
						helperText={confirmPasswordError}
					/>
					{/* Additional components or buttons can be added here */}
					<SecureButton onClick={() => {
						recover(seed, password, biometric, language, navigate, setSuccess, setError, setMessage);
					}}
					sx={{marginTop: '5%'}}
					endIcon={<ArrowForward style={{color: '#FFF'}} />}
					>
						<mui.Typography sx={{fontSize: '1.2rem', fontWeight: 700}}>
                    Secure
						</mui.Typography>
					</SecureButton>

				</mui.Box>
			)}
			{isLoading && (
				<mui.CircularProgress sx={{marginTop: '20%', color: '#00ffaa', top: 0}} />
			)}
		</Layout>
	);
};

export default Recovery;
