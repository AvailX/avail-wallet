import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import * as platform from 'platform';

/** STYLES */
import { ThemeProvider } from "@emotion/react";
import { theme } from "./styles/theme";

/** COMPONENTS */
import Entrypoint from "./views-desktop/entrypoint";
import { useWalletConnectManager } from "./context/WalletConnect";

/* Components for Testing */
import Send from "./views-desktop/send";
import Home from "./views-desktop/home-desktop";

function App() {

  const {walletConnectManager} = useWalletConnectManager();

  useEffect(() => {

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';


      walletConnectManager.close();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }



  }, []);


  return (
    <ThemeProvider theme={theme} >

      <Entrypoint/>

    </ThemeProvider>
  )
}

export default App;
