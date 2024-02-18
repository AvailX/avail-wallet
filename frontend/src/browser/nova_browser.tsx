import React, { useState } from 'react';

//tauri tools
import { listen } from '@tauri-apps/api/event';


import { dapps } from '../assets/dapps/dapps';
import DappView from '../components/dApps/dapp';


//styles
import { AppBar, Toolbar, IconButton, InputBase, Paper, Box, Button,Grid,Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { Title2Text } from '../components/typography/typography';

//global state
import { useWalletConnectManager } from "../context/WalletConnect";

import { useTranslation } from 'react-i18next';
import { useScan } from '../context/ScanContext';

//alerts
import { ErrorAlert,SuccessAlert,WarningAlert,InfoAlert } from '../components/snackbars/alerts';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  marginLeft: 0,
  width: '60%',
}));

interface BrowserProps {
  initialUrl?: string;
  theme?: 'dark' | 'light';
  handleDappSelection: (url: string) => void;
}

const Browser: React.FC<BrowserProps> = ({ initialUrl, theme = 'light',handleDappSelection }) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [inputUrl, setInputUrl] = useState(url);
  const [previousUrls, setPreviousUrls] = useState<string[]>([]);
  const [wcURL, setWcURL] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  //alert states
  const [errorAlert, setErrorAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [warningAlert, setWarningAlert] = useState(false);
  const [infoAlert, setInfoAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { startScan, endScan } = useScan();

  const {walletConnectManager} = useWalletConnectManager();

  const { t } = useTranslation();

  const handleConnected = () => {
    walletConnectManager.pair(wcURL).catch(()=>{
      setAlertMessage('Error connecting');
      setErrorAlert(true);
    });
    sessionStorage.setItem('connected', 'true');
  }

  const getConnectState = () => {
    const connected = sessionStorage.getItem('connected');
    if (connected === 'true') {
      return true;
    }
    return false;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(event.target.value);
  };

  const handleInputWcURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWcURL(event.target.value);
  };

 const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputUrl && inputUrl !== url && inputUrl !== '') {
      setPreviousUrls([...previousUrls, url]);
      setUrl(inputUrl);
      setShowMenu(false);

      sessionStorage.setItem('activeUrl', inputUrl);
    }
  };

  const handleDisconnect = () => {
    walletConnectManager.close().then(() => {
      setAlertMessage(t("browser.messages.success.disconnect"));
      setSuccessAlert(true);
    }).catch((error) => {
      setAlertMessage('Error disconnecting '+error);
      setErrorAlert(true);
    });
  }

  const handleBack = () => {

    setUrl(previousUrls[previousUrls.length - 1]);
    setInputUrl(previousUrls[previousUrls.length - 1]);
    setPreviousUrls(previousUrls.slice(0, previousUrls.length - 1));

    if (previousUrls.length === 0) {
      setInputUrl('');
      setUrl('');
      sessionStorage.removeItem('activeUrl');
      setShowMenu(true);
      console.log('showMenu', showMenu);
    }

  };

  const handleReload = () => {
    // Logic for reload action
    setUrl(inputUrl);
    const iframe = document.querySelector('iframe');
    if (iframe) {
     iframe.src = inputUrl;
    }

  };
  
  const handleDappSelect = (url: string) => {
    setInputUrl(url);
    setUrl(url);
    setShowMenu(false);


    const iframe = document.querySelector('iframe');
    if (iframe) {
     iframe.src = url;
     sessionStorage.setItem('activeUrl', url);
    }
  }

  React.useEffect(() => {

    //check for active url in session storage
    const activeUrl = sessionStorage.getItem('activeUrl');
    console.log('activeUrl', activeUrl);
    if (activeUrl) {
      setUrl(activeUrl);
      setInputUrl(activeUrl);
    }

    const connected = getConnectState();
    setConnected(connected);

    const unlisten_connected =listen('connected', (event) => {
      setConnected(true);
    });

    const unlisten_disconnected = listen('disconnected', (event) => {
      setConnected(false);
    });

    const unlisten_wc_transaction_start = listen('wc_transaction_start', (event) => {
      startScan();
    })

    const unlisten_wc_transaction_end = listen('wc_transaction_end', (event) => {
      endScan();
    })
  
    return () => {
       unlisten_connected.catch(() => {});
      unlisten_disconnected.catch(() => {});
    };

  }, []);


  return (
    <Box sx={{ ml: '5%', height: '94vh', width: '94%' }}>
      <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={alertMessage}/>
      <SuccessAlert successAlert={successAlert} setSuccessAlert={setSuccessAlert} message={alertMessage}/>
      <AppBar position="static" sx={{ bgcolor: '#111111' }} >
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={handleBack}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="reload" onClick={handleReload}>
            <RefreshIcon />
          </IconButton>
          <Search>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '50%' }}
              onSubmit={handleInputSubmit}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={t("browser.enter") + " URL"}
                inputProps={{ 'aria-label': 'enter url' }}
                value={inputUrl}
                onChange={handleInputChange}
              />
            </Paper>
          </Search>
          <Box sx={{ width: '30%', ml: '2%' }}>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '80%' }}
              onSubmit={handleInputSubmit}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={t("browser.enter") + " Wallet Connect Link"}
                inputProps={{ 'aria-label': 'enter url' }}
                value={wcURL}
                onChange={handleInputWcURL}
              />
            </Paper>
          </Box>
          <Button sx={{
            borderRadius: '10px', width: '12%', bgcolor: '#00FFAA', color: '#111111',
            transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
            textTransform: 'none',
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
          onClick={() => { connected? handleDisconnect():walletConnectManager.pair(wcURL)}}
          > {connected? t("browser.message.success.disconnect"):t("browser.connect")}</Button>
        </Toolbar>
      </AppBar>
      {url !== '' &&
      <iframe
        src={url}
        title="Browser"
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
      />
      }
      {url === '' &&
     <Box sx={{display:'flex',flexDirection:'column',p:'20px',ml:'2%'}}>
     <Title2Text sx={{color:'#fff'}}> {t("browser.title")} </Title2Text>
      <Typography variant="body1" sx={{color:'#a3a3a3'}}> 
        {t("browser.subtitle")}
      </Typography>
      <Grid container spacing={2} sx={{marginTop:'20px'}}>
        {dapps.map((dapp,index) => (
          <Grid item xs={12} md={4} key={index}>
            <DappView dapp={dapp} onClick={() => {handleDappSelect(dapp.url); handleDappSelection(dapp.url)}}/>
          </Grid>
        ))}
      </Grid>

     </Box>
      }
    </Box>
  );
};

export default Browser;