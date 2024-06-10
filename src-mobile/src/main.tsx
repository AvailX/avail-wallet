import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./style.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import QuestsCampaign from "./views/quests/QuestsCampaign";
import { Campaign } from "@mui/icons-material";
import Dashboard from "./views/Dashboard";
import QuestsScreen from "./views/quests/QuestsScreen";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* <Quests /> */}
      {/* <Dashboard /> */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
