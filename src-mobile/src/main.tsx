import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WalletConnectProvider } from "../../../avail-wallet/src/context/WalletConnect";
import { ScanProvider } from "../../../avail-wallet/src/context/ScanContext";
import { RecentEventsProvider } from "../../../avail-wallet/src/context/EventsContext";

import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "@mui/material";
import theme from "./theme";

import i18n from "../i18next-config";

// See if language is set in local storage
const storedLanguage = localStorage.getItem("language");

if (storedLanguage) {
  await i18n.changeLanguage(storedLanguage);
} else {
  await i18n.changeLanguage("en");
}

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
