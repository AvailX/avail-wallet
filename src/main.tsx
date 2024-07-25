import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WalletConnectProvider } from "../src-desktop/context/WalletConnect";
import { ScanProvider } from "../src-desktop/context/ScanContext";
import { RecentEventsProvider } from "../src-desktop/context/EventsContext";

import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "@mui/material";
import theme from "./theme";

import i18n from "../src-desktop/i18next-config";

// See if language is set in local storage
const storedLanguage = localStorage.getItem("language");

const handleLanguage = async () => {
  if (storedLanguage) {
    await i18n.changeLanguage(storedLanguage);
  } else {
    await i18n.changeLanguage("en");
  }
}

handleLanguage();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletConnectProvider>
      <ScanProvider>
        <RecentEventsProvider>
          <ThemeProvider theme={theme}>
            <App />
            <ToastContainer />
          </ThemeProvider>
        </RecentEventsProvider>
      </ScanProvider>
    </WalletConnectProvider>
  </React.StrictMode>
);
