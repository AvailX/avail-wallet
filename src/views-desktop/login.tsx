import * as React from 'react';
import * as mui from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Components
import ArrowForward from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { os } from '../services/util/open';
import WhiteHueTextField from '../components/textfields/white-hue';
import LoginButton from '../components/buttons/login-button';
import NewAccountDialog from '../components/dialogs/new_account';
import LanguageSelector from '../components/select/language';

// Services
import {
  session_and_local_auth,
  get_hash,
} from '../services/authentication/auth';
import { getViewingKey } from '../services/storage/keys';

// Images
import full_logo from '../assets/logo/desktop-full-logo.svg';
import loginimage from '../assets/images/backgrounds/sign-up-bg.jpeg';

// Typography
import {
  TitleText,
  SmallText,
  BodyText,
  SmallText400,
} from '../components/typography/typography';
import { Languages } from '../types/languages';

// Errors
import { type AvailError } from '../types/errors';

// Alerts
import {
  ErrorAlert,
  WarningAlert,
  SuccessAlert,
  InfoAlert,
} from '../components/snackbars/alerts';
import Layout from './reusable/layout';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';

function Login() {
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [newAccountDialog, setNewAccountDialog] = useState(false);

  const [success, setSuccess] = useState<boolean>(false);
  const [info, setInfo] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);

  const [message, setMessage] = useState<string>('');
  const [language, setLanguage] = useState(Languages.English);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const md = useMediaQuery('(min-width:1000px)');
  const lg = useMediaQuery('(min-width:1200px)');

  const handleLogin = () => {
    session_and_local_auth(password, navigate, setError, setMessage, false)
      .then(() => {
        setMessage(t('login.messages.success'));
        setSuccess(true);

        navigate('/home');
      })
      .catch(async (error_) => {
        const error = error_ as AvailError;

        if (error.error_type.toString() === 'Network') {
          setMessage('No Wifi Connection');
          setWarning(true);

          getViewingKey(password)
            .then(() => {
              navigate('/home');
            })
            .catch((error_) => {
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
      <ErrorAlert
        errorAlert={error}
        message={message}
        setErrorAlert={setError}
      />
      <WarningAlert
        warningAlert={warning}
        message={message}
        setWarningAlert={setWarning}
      />
      <InfoAlert infoAlert={info} message={message} setInfoAlert={setInfo} />
      <SuccessAlert
        successAlert={success}
        message={message}
        setSuccessAlert={setSuccess}
      />

      {/* New Account Dialog */}
      <NewAccountDialog
        isOpen={newAccountDialog}
        onRequestClose={() => {
          setNewAccountDialog(false);
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <Box
          sx={{
            height: '100vh',
            width: '50%',
            backgroundImage: `linear-gradient(to right, transparent, #111111),url(${loginimage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        {/* Right side contents in a Grid */}
        <Grid
          width={'46%'}
          sx={{
            marginTop: lg ? '7%' : md ? '5.5%' : '3%',
            ml: lg ? '4%' : md ? '5%' : '7%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <img
              src={full_logo}
              style={{
                width: md ? '40%' : '50%',
                height: 'auto',
                marginLeft: md ? '-20px' : '-10px',
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', mr: '4%' }}>
              <LanguageSelector
                language={language}
                setLanguage={setLanguage}
                sx={{ alignSelf: 'flex-end', mr: '5%' }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '90%',
              mt: '-20px',
            }}
          >
            <TitleText sx={{ color: '#FFF' }}>
              {' '}
              {t('login.tagline.part1')}{' '}
            </TitleText>
            <TitleText sx={{ ml: '2.5%', color: '#00FFAA' }}>
              {' '}
              {t('login.tagline.part2')}{' '}
            </TitleText>
          </Box>

          {/* --Password Input-- */}
          <WhiteHueTextField
            id='password'
            label={t('login.password')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
            }}
            value={password}
            type={passwordHidden ? 'password' : ''}
            inputProps={{ style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#fff' } }}
            sx={{ width: lg ? '70%' : md ? '80%' : '90%', marginTop: '30%' }}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />

          <LoginButton
            onClick={() => {
              handleLogin();
            }}
            sx={{ marginTop: '5%' }}
            endIcon={<ArrowForward style={{ color: '#FFF' }} />}
          >
            {t('login.CTAButton')}
          </LoginButton>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '10%',
              width: lg ? '70%' : md ? '80%' : '90%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                color: '#a3a3a3',
                fontSize: 18,
                fontWeight: '700',
                wordWrap: 'break-word',
                alignContent: 'end',
              }}
            >
              {' '}
              {t('login.access')}
            </Typography>
            <Button
              sx={{
                display: 'flex',
                width: '123px',
                height: '35px',
                borderRadius: 9,
                color: '#FFF',
                background: '#3E3E3E',
                '&:hover': { background: '#00FFAA', color: '#000' },
              }}
              onClick={() => {
                navigate('/recovery');
              }}
            >
              <BodyText
                sx={{
                  fontWeight: '700',
                  wordWrap: 'break-word',
                  textTransform: 'none',
                }}
              >
                {t('login.recover')}
              </BodyText>
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: '4%',
              width: lg ? '70%' : md ? '80%' : '90%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                color: '#a3a3a3',
                fontSize: 18,
                fontWeight: '700',
                wordWrap: 'break-word',
                alignContent: 'end',
              }}
            >
              Want to create a new account ?
            </Typography>
            <Button
              sx={{
                display: 'flex',
                width: '123px',
                height: '35px',
                borderRadius: 9,
                background: '#3E3E3E',
                color: '#FFFFFF',
                '&:hover': { background: '#00FFAA', color: '#000' },
              }}
              onClick={() => {
                setNewAccountDialog(true);
              }}
            >
              <SmallText400
                sx={{
                  fontWeight: '700',
                  wordWrap: 'break-word',
                  textTransform: 'none',
                }}
              >
                New Account
              </SmallText400>
            </Button>
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Login;
