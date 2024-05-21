import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./style.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import Quests from "./views/quests/Quests";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Quests />
    </ThemeProvider>
  </React.StrictMode>
);
