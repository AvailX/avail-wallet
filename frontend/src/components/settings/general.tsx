import * as React from 'react';
import * as mui from '@mui/material';

import i18n from '../../i18next-config';
import { languages } from '../select/language';
import { useTranslation } from 'react-i18next';
import { updateUsername } from '../../services/storage/persistent';
import SaveIcon from '@mui/icons-material/Save';

import UsernameDialog from '../dialogs/username';

//alerts
import { ErrorAlert, SuccessAlert } from '../snackbars/alerts';

interface Language {
  symbol: string;
  name: string;
}

const GeneralSettings: React.FC<{
  username: string;
  setUsername: (username: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  network: string;
  address: string;
}> = ({ username, setUsername, network, address }) => {
  const [language, setLanguage] = React.useState<Language>({symbol: "en", name: "English"});
  const [success, setSuccess] = React.useState<boolean>(false);
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [originalUsername, setOriginalUsername] = React.useState(username);
  const [UsernameDialogOpen, setUsernameDialogOpen] = React.useState(false);

  const {t} = useTranslation();
  
  // Handlers for change events
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleLanguageChange = (event: mui.SelectChangeEvent) => {
    //setLanguage(event.target.value as string);
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };

  React.useEffect(() => {
    setOriginalUsername(username);
    const lng = i18n.language;
    const selectedLanguage = languages.find((lang) => lang.symbol === lng);
    if (selectedLanguage)
      setLanguage(selectedLanguage);
  }, []);

  return (
    <mui.Box sx={{ padding: 2 }}>
      <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message}/>
      <SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
      <UsernameDialog isOpen={UsernameDialogOpen} onRequestClose={()=>{setUsernameDialogOpen(false)}} username={username} originalUsername={originalUsername}/>
      <mui.TextField
        label={t("signup.username")}
        variant="outlined"
        value={username}
        onChange={handleUsernameChange}
        fullWidth
        margin="normal"
        sx={{ backgroundColor: '#2c2c2c', '.MuiOutlinedInput-root': { color: '#fff' }, '.MuiInputLabel-root': { color: '#aaa' } }}
        InputProps={{
          endAdornment: username !== originalUsername ? (
            <mui.InputAdornment position="end">
              <mui.IconButton
                onClick={() => {setUsernameDialogOpen(true)}}
                sx={{ color: '#fff' }}
              >
                <SaveIcon/>
              </mui.IconButton>
            </mui.InputAdornment>
          ) : null,
        }}
      />
      <mui.FormControl fullWidth margin="normal">
        <mui.InputLabel id="language-select-label" sx={{ color: '#aaa' }}>Language</mui.InputLabel>
        <mui.Select
          labelId="language-select-label"
          id="language-select"
          value={language.symbol}
          label="Language"
          onChange={(e) => handleLanguageChange(e)}
          sx={{ backgroundColor: '#2c2c2c', '.MuiOutlinedInput-root': { color: '#fff' }, '.MuiSelect-icon': { color: '#aaa' },color:'#fff' }}
        >
          {languages.map((option) => (
            <mui.MenuItem key={option.symbol} value={option.symbol}>
              {option.name}
            </mui.MenuItem>
          ))}
        </mui.Select>
      </mui.FormControl>
      <mui.TextField
        label="Network"
        variant="outlined"
        value={network}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
        sx={{ backgroundColor: '#2c2c2c', '.MuiOutlinedInput-root': { color: '#fff' }, '.MuiInputLabel-root': { color: '#aaa' } }}
      />
      <mui.TextField
        label="Address"
        variant="outlined"
        value={address}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
        sx={{ backgroundColor: '#2c2c2c', '.MuiOutlinedInput-root': { color: '#fff' }, '.MuiInputLabel-root': { color: '#aaa' } }}
      />
    </mui.Box>
  );
};

export default GeneralSettings;