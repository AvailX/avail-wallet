import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import i18n from '../../i18next-config';
import { languages } from '../select/language';
import { updateUsername } from '../../services/storage/persistent';
import UsernameDialog from '../dialogs/username';

// Alerts
import { ErrorAlert, SuccessAlert } from '../snackbars/alerts';
import { FC, useState, ChangeEvent, useEffect } from 'react';
import {
  SelectChangeEvent,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

type Language = {
  symbol: string;
  name: string;
};

const GeneralSettings: FC<{
  username: string;
  setUsername: (username: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  network: string;
  address: string;
}> = ({ username, setUsername, network, address }) => {
  const [language, setLanguage] = useState<Language>({
    symbol: 'en',
    name: 'English',
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [originalUsername, setOriginalUsername] = useState(username);
  const [UsernameDialogOpen, setUsernameDialogOpen] = useState(false);

  const { t } = useTranslation();

  // Handlers for change events
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    // SetLanguage(event.target.value as string);
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };

  useEffect(() => {
    setOriginalUsername(username);
    const lng = i18n.language;
    const selectedLanguage = languages.find((lang) => lang.symbol === lng);
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, []);

  return (
    <Box sx={{ padding: 2 }}>
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <UsernameDialog
        isOpen={UsernameDialogOpen}
        onRequestClose={() => {
          setUsernameDialogOpen(false);
        }}
        username={username}
        originalUsername={originalUsername}
      />
      <TextField
        label={t('signup.username')}
        variant='outlined'
        value={username}
        onChange={handleUsernameChange}
        fullWidth
        margin='normal'
        sx={{
          backgroundColor: '#2c2c2c',
          '.MuiOutlinedInput-root': { color: '#fff' },
          '.MuiInputLabel-root': { color: '#aaa' },
        }}
        InputProps={{
          endAdornment:
            username === originalUsername ? null : (
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => {
                    setUsernameDialogOpen(true);
                  }}
                  sx={{ color: '#fff' }}
                >
                  <SaveIcon />
                </IconButton>
              </InputAdornment>
            ),
        }}
      />
      <FormControl fullWidth margin='normal'>
        <InputLabel id='language-select-label' sx={{ color: '#aaa' }}>
          Language
        </InputLabel>
        <Select
          labelId='language-select-label'
          id='language-select'
          value={language.symbol}
          label='Language'
          onChange={(e) => {
            handleLanguageChange(e);
          }}
          sx={{
            backgroundColor: '#2c2c2c',
            '.MuiOutlinedInput-root': { color: '#fff' },
            '.MuiSelect-icon': { color: '#aaa' },
            color: '#fff',
          }}
        >
          {languages.map((option) => (
            <MenuItem key={option.symbol} value={option.symbol}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label='Network'
        variant='outlined'
        value={network}
        fullWidth
        margin='normal'
        InputProps={{
          readOnly: true,
        }}
        sx={{
          backgroundColor: '#2c2c2c',
          '.MuiOutlinedInput-root': { color: '#fff' },
          '.MuiInputLabel-root': { color: '#aaa' },
        }}
      />
      <TextField
        label='Address'
        variant='outlined'
        value={address}
        fullWidth
        margin='normal'
        InputProps={{
          readOnly: true,
        }}
        sx={{
          backgroundColor: '#2c2c2c',
          '.MuiOutlinedInput-root': { color: '#fff' },
          '.MuiInputLabel-root': { color: '#aaa' },
        }}
      />
    </Box>
  );
};

export default GeneralSettings;
