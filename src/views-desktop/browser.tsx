// Components
import { listen } from '@tauri-apps/api/event';
import { useLocation } from 'react-router-dom';
import MiniDrawer from '../components/sidebar';
import ReAuthDialog from '../components/dialogs/reauth';

// Tauri tools

// global state
import { useWalletConnectManager } from '../context/WalletConnect';
import Browser from '../browser/nova_browser';
import { Title2Text } from '../components/typography/typography';
import Layout from './reusable/layout';
import { FC, useState, useEffect } from 'react';

const BrowserView: FC = () => {
  const location = useLocation();

  const [url, setUrl] = useState('');
  const [reauthDialogOpen, setReauthDialogOpen] = useState(false);

  // TODO - Handle the activeUrl state
  const { activeUrl, setActiveUrl } = useWalletConnectManager();

  function handleUrl() {
    console.log('Location State ' + location.state);
    if (location.state !== undefined) {
      const state = location.state as string;
    } else if (activeUrl !== '') {
      if (activeUrl !== 'https://faucet.puzzle.online') {
        setUrl(activeUrl);
      }
    }
  }

  function handleDappSelection(url: string) {
    console.log('handleDappSelection', url);
    setUrl(url);
    setActiveUrl(url);
  }

  useEffect(() => {
    handleUrl();
  }, []);

  /* --Event Listners */
  useEffect(() => {
    listen('reauthenticate', (event) => {
      setReauthDialogOpen(true);
    });
  }, []);

  if (
    location.state !== undefined &&
    location.state !== null &&
    location.state !== ''
  ) {
    return (
      <Layout>
        <ReAuthDialog
          isOpen={reauthDialogOpen}
          onRequestClose={() => {
            setReauthDialogOpen(false);
          }}
        />
        <MiniDrawer />
        <Browser
          initialUrl={location.state}
          handleDappSelection={handleDappSelection}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ReAuthDialog
        isOpen={reauthDialogOpen}
        onRequestClose={() => {
          setReauthDialogOpen(false);
        }}
      />
      <MiniDrawer />
      <Browser initialUrl={url} handleDappSelection={handleDappSelection} />
    </Layout>
  );
};

export default BrowserView;
