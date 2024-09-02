// Components
import Divider from '@mui/material/Divider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { ArrowBack } from '@mui/icons-material';

// Services
import { checkBiometrics } from '../services/authentication/register';
import { recover } from '../services/recovery/phrase';

// Typography
import {
  Title2Text,
  SubtitleText,
  BodyText,
  SubMainTitleText,
  TitleText,
} from '../components/typography/typography';

// Icons

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Alerts
import {
  SuccessAlert,
  ErrorAlert,
  InfoAlert,
} from '../components/snackbars/alerts';

// Hooks
import { Languages } from '../types/languages';
import Layout from './reusable/layout';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Snackbar,
  Alert,
  Box,
  Button,
  InputAdornment,
  Typography,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useState, ChangeEvent, useEffect } from 'react';

import bgImg from '../assets/images/backgrounds/avail-gradients.png';

const Recovery = () => {
  const md = useMediaQuery('(min-width:1000px)');
  const lg = useMediaQuery('(min-width:1200px)');

  const [password, setPassword] = useState<string>('');
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [confirmPasswordHidden, setConfirmPasswordHidden] =
    useState<boolean>(true);
  const [dateVal, setDateVal] = useState<Dayjs | null>(null);

  const [isSecureAccountVisible, setIsSecureAccountVisible] = useState(false);
  const [chooseDate, setChooseDate] = useState(false);

  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState(false);
  const [seedNotice, setSeedNotice] = useState(true);
  const [dateNotice, setDateNotice] = useState(false);
  const [message, setMessage] = useState('');

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  // BiometricAvail is to check if user can use biometrics
  const [biometricAvail, setBiometricAvail] = useState<boolean>(false);
  const [biometric, setBiometric] = useState<boolean>(false);
  const [seed, setSeed] = useState<string>('');
  const [language, setLanguage] = useState<Languages>(Languages.English);

  const navigate = useNavigate();

  const handleOrdering = () => {
    //check if seed is 12 || 15 || 18 || 21 || 24 words
    if (
      seed.split(' ').length === 12 ||
      seed.split(' ').length === 15 ||
      seed.split(' ').length === 18 ||
      seed.split(' ').length === 21 ||
      seed.split(' ').length === 24
    ) {
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

    {
      /*
		// Simulate loading with a timeout
		setTimeout(() => {
			setIsLoading(false); // Hide loading indicator
			setIsSecureAccountVisible(true);
			setSeedNotice(false);
			setDateNotice(true);
		}, 1500); // You can adjust the timeout duration
		*/
    }
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

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);

    // You might also want to check if the passwords match here, or do it separately.
    if (newConfirmPassword === password) {
      setConfirmPasswordError(validatePassword(newConfirmPassword));
    } else {
      setConfirmPasswordError(t('signup.messages.errors.passwordMismatch'));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setSeedNotice(false);
    }, 5000);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `url(${bgImg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <InfoAlert infoAlert={info} setInfoAlert={setInfo} message={message} />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />

      {/*-- Seed Info Notice --*/}
      <Snackbar
        open={seedNotice}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ width: '60%' }}
      >
        <div>
          <Alert severity='info'>
            Notice: If you already have an account this action will destroy it.
            Secret phrases from other wallets might not work and generate a
            different account. Use the import page to import accounts from other
            wallets :)
          </Alert>
        </div>
      </Snackbar>

      {/*-- Date Info Notice --*/}
      <Snackbar
        open={dateNotice}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ width: '60%' }}
      >
        <div>
          <Alert severity='info'>
            Notice: If you want to start from a specific date, you can set the
            date here. Otherwise, you can just press continue and the wallet
            will scan the entire blockchain for your transactions and records.
          </Alert>
        </div>
      </Snackbar>
      <Box width='50%'>
        {!isSecureAccountVisible && (
          <>
            <img
              src={a_logo}
              alt='aleo logo'
              style={{
                width: '60px',
                height: '60px',
                marginTop: '20px',
                marginLeft: '20px',
                cursor: 'pointer',
              }}
              onClick={() => {
                window.history.back();
              }}
            />
            <TitleText sx={{ color: '#FFF', mt: 2 }}>
              Import secret phrase to recover
            </TitleText>

            <TextField
              placeholder='Input your secret recovery phrase..'
              value={seed}
              variant='standard'
              inputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
              onChange={(e) => {
                setSeed(e.target.value);
              }}
              sx={{
                width: '100%',
                alignSelf: 'center',
                mt: '10%',
                mb: '30px',
              }}
              InputProps={{
                sx: {
                  // fontSize: '1.3rem',
                  wordWrap: 'break-word',
                },
              }}
            />

            <CTAButton
              text={t('recover.recover')}
              onClick={() => {
                handleOrdering();
              }}
              width='100%'
            />
            <Button
              onClick={() => {
                navigate('/register');
              }}
              fullWidth
              sx={{ mt: 2, py: 2 }}
              variant='outlined'
            >
              Back
            </Button>
          </>
        )}

        {/* --Account Details-- */}
        {isSecureAccountVisible && (
          <Box
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '80%',
                alignSelf: 'center',
              }}
            >
              <Button
                variant='contained'
                onClick={() => {
                  setIsSecureAccountVisible(false);
                }}
                sx={{
                  width: '10%',
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  ml: '2%',
                  height: '50px',
                  '&:hover': {
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
                <ArrowBack
                  sx={{ width: '30px', height: '30px', color: '#fff' }}
                />
              </Button>
              <Title2Text sx={{ color: '#00FFAA', mt: '10%' }}>
                Secure your Account
              </Title2Text>
              <LanguageSelector language={language} setLanguage={setLanguage} />
            </Box>
            <WhiteHueTextField
              id='password'
              label='Password'
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handlePasswordChange(event);
              }}
              value={password}
              type={passwordHidden ? 'password' : ''}
              inputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
              sx={{ width: md ? '55%' : '65%', marginTop: md ? '6%' : '3%' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {passwordHidden ? (
                      <VisibilityOffIcon
                        style={{ color: '#FFF', cursor: 'pointer' }}
                        onClick={() => {
                          setPasswordHidden(false);
                        }}
                      />
                    ) : (
                      <VisibilityIcon
                        style={{ color: '#FFF' }}
                        onClick={() => {
                          setPasswordHidden(true);
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
              error={Boolean(passwordError)}
              helperText={passwordError}
            />

            <WhiteHueTextField
              id='confirmPassword'
              label='Confirm Password'
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleConfirmPasswordChange(event);
              }}
              value={confirmPassword}
              color='primary'
              type={confirmPasswordHidden ? 'password' : ''}
              inputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
              sx={{ width: md ? '55%' : '65%', marginTop: md ? '2%' : '3%' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {confirmPasswordHidden ? (
                      <VisibilityOffIcon
                        style={{ color: '#FFF', cursor: 'pointer' }}
                        onClick={() => {
                          setConfirmPasswordHidden(false);
                        }}
                      />
                    ) : (
                      <VisibilityIcon
                        style={{ color: '#FFF' }}
                        onClick={() => {
                          setConfirmPasswordHidden(true);
                        }}
                      />
                    )}
                  </InputAdornment>
                ),
              }}
              error={Boolean(confirmPasswordError)}
              helperText={confirmPasswordError}
            />
            {/* Additional components or buttons can be added here */}
            <SecureButton
              onClick={() => {
                recover(
                  seed,
                  password,
                  biometric,
                  language,
                  navigate,
                  setSuccess,
                  setError,
                  setMessage
                );
              }}
              sx={{ marginTop: '5%' }}
              endIcon={<ArrowForward style={{ color: '#FFF' }} />}
            >
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Secure
              </Typography>
            </SecureButton>
          </Box>
        )}
        {isLoading && (
          <CircularProgress
            sx={{ marginTop: '20%', color: '#00ffaa', top: 0 }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Recovery;
