import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { WalletConnectProvider } from "../../../avail-wallet/src/context/WalletConnect";
import { ScanProvider } from "../../../avail-wallet/src/context/ScanContext";
import { RecentEventsProvider } from "../../../avail-wallet/src/context/EventsContext";

import "./style.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import QuestsCampaign from "./views/quests/QuestsCampaign";
import { Campaign } from "@mui/icons-material";
import Dashboard from "./views/Dashboard";
import QuestsScreen from "./views/quests/QuestsScreen";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletConnectProvider>
      <ScanProvider>
        <RecentEventsProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </RecentEventsProvider>
      </ScanProvider>
    </WalletConnectProvider>
  </React.StrictMode>
);
