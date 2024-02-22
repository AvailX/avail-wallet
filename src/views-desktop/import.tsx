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
import {import_wallet} from '../services/authentication/register';
import {delete_local_for_recovery} from '../services/recovery/phrase';
import bs58 from 'bs58';

// Typography
import {
	Title2Text, SubtitleText, BodyText, SubMainTitleText,
} from '../components/typography/typography';

// Icons

// Images
import a_logo from '../assets/logo/a-icon.svg';
import { ArrowBack } from '@mui/icons-material';

// Alerts
import {SuccessAlert, ErrorAlert,InfoAlert} from '../components/snackbars/alerts';

// Hooks
import {Languages} from '../types/languages';
import Layout from './reusable/layout';

const Import = () => {
	const md = mui.useMediaQuery('(min-width:1000px)');
	const lg = mui.useMediaQuery('(min-width:1200px)');

    const [username, setUsername] = React.useState<string>('');
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
	const [keyNotice,setKeyNotice] = React.useState(true);
	const [dateNotice,setDateNotice] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const {t} = useTranslation();

	const [isLoading, setIsLoading] = React.useState(false);
	// BiometricAvail is to check if user can use biometrics
	const [biometricAvail, setBiometricAvail] = React.useState<boolean>(false);
	const [biometric, setBiometric] = React.useState<boolean>(false);
	const [key, setKey] = React.useState<string>('');
	const [language, setLanguage] = React.useState<Languages>(Languages.English);

	const navigate = useNavigate();


    function validatePrivateKey(pk: string) {
        if (pk.length !== 59) {
            setMessage('Invalid private key length');
            setError(true);
           return false;
        }

        if (pk.substring(0, 12) !== "APrivateKey1") {
            setMessage('Invalid private key prefix');
            setError(true);
            return false;
        }

        const base58 = pk.substring(12);
        try {
            const base58res = bs58.decode(base58);
        } catch (error) {
            setMessage('Invalid private key');
            setError(true);
            return false;
        }

        // If everything is ok, return true to indicate success
        return true;
    }

	const handleOrdering = () => {
		//check if privateKey is valid
		if (validatePrivateKey(key)) {
			setIsSecureAccountVisible(true);
			setKeyNotice(false);
		} else {
			setKeyNotice(false);

			setTimeout(() => {
				setKeyNotice(true);
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
			<mui.Snackbar open={keyNotice}  anchorOrigin={{vertical: 'top', horizontal: 'center'}} sx={{width:'60%'}}>
			<div>
			<mui.Alert severity='info'>
			 Notice:  If you already have an account this action will destroy it. This will create an Avail Wallet from the private key you're importing. The wallet will scan the entire blockchain for your transactions and records.
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
						placeholder='Input the private key your are importing..'
						value={key}
						onChange={e => {
							setKey(e.target.value);
						}}
						sx={{
							width: '70%', alignSelf: 'center', padding: '5%', mt: '10%', mb: '10%',
						}}
						InputProps={{sx: {height: '100px', fontSize: '1.3rem', wordWrap: 'break-word'}}}
					/>

					<CTAButton text="Import" onClick={() => {
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
                        <mui.Button
                            variant='contained'
                            onClick={() => {
                                setIsSecureAccountVisible(false);
                            }}
                            sx={{
                                width: '10%', bgcolor: 'transparent', boxShadow: 'none', ml: '2%', height: '50px', '&:hover': {
                                    backgroundColor: '#00FFAA',
                                    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
                                    transform: 'scale(1.03)',
                                },
                                '&:focus': {
                                    backgroundColor: '#00FFAA',
                                    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
                                },
                            }}
                        >
                            <ArrowBack sx={{width: '30px', height: '30px', color: '#fff'}} />
                        </mui.Button>
						<Title2Text sx={{color: '#00FFAA', mt: '10%'}}>Secure your Account</Title2Text >
						<LanguageSelector language={language} setLanguage={setLanguage}/>
					</mui.Box>

                    <WhiteHueTextField
						id='username'
						label={t('signup.username')}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							setUsername(event.target.value);
						}}
						value={username}
						inputProps={{style: {color: '#fff'}}}
						InputLabelProps={{style: {color: '#fff'}}}
						sx={{width: md ? '55%' : '65%', marginTop: md ? '2%' : '3%'}}
					/>

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
						sx={{width: md ? '55%' : '65%', marginTop: md ? '2%' : '3%'}}
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
                        delete_local_for_recovery(password).then(() => {
						import_wallet(username,password, false,key, language).then((res)=>{
                            setMessage("Successfully imported wallet");
                            setSuccess(true);
                            navigate('/home');
                        }).catch((err)=>{
                            console.log(err);
                            setMessage("Error importing wallet");
                            setError(true);
                            //refresh the page
                            window.location.reload();
                        });}).catch((err)=>{
                            console.log(err);
                            setMessage("Error importing wallet");
                            setError(true);
                            window.location.reload();
                        });
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

export default Import;