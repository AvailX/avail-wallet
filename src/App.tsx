import React from 'react';
import { useEffect, useState, useRef } from 'react';

/** STYLES */
import { ThemeProvider } from '@emotion/react';
import { theme } from './styles/theme';

/** COMPONENTS */
import Entrypoint from './views-desktop/entrypoint';
import { useWalletConnectManager } from './context/WalletConnect';
import NewBgLayout from '../src/components/NewBgLayout';

function App() {
  const { walletConnectManager } = useWalletConnectManager();

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';

      await walletConnectManager.close();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <NewBgLayout>
        <Entrypoint />
      </NewBgLayout>
    </ThemeProvider>
  );
}

export default App;
