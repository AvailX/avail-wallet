import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

// Components
import ArrowForward from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WhiteHueTextField from '../components/textfields/white-hue';
import LoginButton from '../components/buttons/login-button';

// Services
import {session_and_local_auth, local_auth, get_hash} from '../services/authentication/auth';
import {getViewingKey} from '../services/storage/keys';

// Images
import full_logo from '../assets/logo/desktop-full-logo.svg';
import loginimage from '../assets/images/backgrounds/sign-up-bg.jpeg';

// Typography
import {TitleText, SmallText, BodyText} from '../components/typography/typography';

// Icons

// Errors
import {type AvailError} from '../types/errors';

// Alerts
import {
	ErrorAlert, WarningAlert, SuccessAlert, InfoAlert,
} from '../components/snackbars/alerts';
import Layout from './reusable/layout';

function Login() {
	const [password, setPassword] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const [passwordHidden, setPasswordHidden] = React.useState(true);

	const [success, setSuccess] = React.useState<boolean>(false);
	const [info, setInfo] = React.useState<boolean>(false);
	const [error, setError] = React.useState<boolean>(false);
	const [warning, setWarning] = React.useState<boolean>(false);

	const [message, setMessage] = React.useState<string>('');

	const navigate = useNavigate();

	const {t} = useTranslation();

	const md = mui.useMediaQuery('(min-width:1000px)');
	const lg = mui.useMediaQuery('(min-width:1200px)');

	const handleLogin = () => {
		session_and_local_auth(password, navigate, setError, setMessage, false).then(() => {
			setMessage(t('login.messages.success'));
			setSuccess(true);

			navigate('/home');
		}).catch(error_ => {
			console.log(error_);
			const error = JSON.parse(error_) as AvailError;

			if (error.error_type.toString() === 'Network') {
				setMessage('No Wifi Connection');
				setWarning(true);

				getViewingKey(password).then(() => {
					navigate('/home');
				}).catch(error_ => {
					console.log(error_);
					setMessage(t('login.messages.error'));
					setError(true);
				});

				return;
			}

			setMessage(t('login.messages.error'));
			setError(true);
		});
	};

	return (
		<Layout>

			{/* --Alerts-- */}
			<ErrorAlert errorAlert={error} message={message} setErrorAlert={setError} />
			<WarningAlert warningAlert={warning} message={message} setWarningAlert={setWarning} />
			<InfoAlert infoAlert={info} message={message} setInfoAlert={setInfo} />
			<SuccessAlert successAlert={success} message={message} setSuccessAlert={setSuccess} />

			<mui.Box sx={{display: 'flex', flexDirection: 'row', width: '100%'}}>

				<mui.Box sx={{
					height: '100vh', width: '50%', backgroundImage: `linear-gradient(to right, transparent, #111111),url(${loginimage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
				}} />

				{/* Right side contents in a Grid */}
				<mui.Grid width={'46%'} sx={{marginTop: lg ? '7%' : (md ? '5.5%' : '3%'), ml: lg ? '4%' : (md ? '5%' : '7%')}}>

					<img src={full_logo} style={{width: md ? '40%' : '50%', height: 'auto', marginLeft: md ? '-20px' : '-10px'}} />
					<mui.Box sx={{
						display: 'flex', flexDirection: 'row', width: '90%', mt: '-20px',
					}}>
						<TitleText sx={{color: '#FFF'}} > {t('login.tagline.part1')} </TitleText>
						<TitleText sx={{ml: '2.5%', color: '#00FFAA'}}> {t('login.tagline.part2')}  </TitleText>
					</mui.Box>

					{/* --Password Input-- */}
					<WhiteHueTextField
						id='password'
						label={t('login.password')}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							setPassword(event.target.value);
						}}
						value={password}
						type={passwordHidden ? 'password' : ''}
						inputProps={{style: {color: '#fff'}}}
						InputLabelProps={{style: {color: '#fff'}}}
						sx={{width: lg ? '70%' : (md ? '80%' : '90%'), marginTop: '30%'}}
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
					/>

					<LoginButton onClick={() => {
						handleLogin();
					}}
					sx={{marginTop: '5%'}}
					endIcon={<ArrowForward style={{color: '#FFF'}} />}
					>
						{t('login.CTAButton')}
					</LoginButton>

					<mui.Box sx={{
						display: 'flex', flexDirection: 'row', marginTop: '10%', width: lg ? '70%' : (md ? '80%' : '90%'), alignItems: 'center', justifyContent: 'space-between',
					}}>
						<mui.Typography sx={{
							color: '#a3a3a3', fontSize: 18, fontWeight: '700', wordWrap: 'break-word', alignContent: 'end',
						}}> {t('login.access')}</mui.Typography>
						<mui.Button sx={{
							display: 'flex', width: '123px', height: '35px', borderRadius: 9, color: '#FFF', background: '#3E3E3E', '&:hover': {background: '#00FFAA', color: '#000'},
						}} onClick={() => {
							navigate('/recovery');
						}}>
							<BodyText sx={{fontWeight: '700', wordWrap: 'break-word', textTransform: 'none'}}>{t('login.recover')}</BodyText>
						</mui.Button>
					</mui.Box>
				</mui.Grid>
			</mui.Box>
		</Layout>
	);
}

export default Login;
