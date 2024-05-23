import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import * as mui from "@mui/material";

// Components
import { listen } from "@tauri-apps/api/event";
import { useLocation } from "react-router-dom";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MiniDrawer from "../../../src/components/sidebar";
import ReAuthDialog from "../../../src/components/dialogs/reauth";
// Tauri tools

import { useNavigate } from "react-router-dom";
// global state
import { useWalletConnectManager } from "../../../src/context/WalletConnect";
import { Title2Text } from "../../../../avail-wallet/src/components/typography/typography";

//imported from the mobile browser to aid editing
import Browser from "../browser/mobile_browser";

const BrowserView: React.FC = () => {
  const location = useLocation();

  const [url, setUrl] = React.useState("");
  const [reauthDialogOpen, setReauthDialogOpen] = React.useState(false);

  //Drawer
  const [open, setOpen] = React.useState<boolean>(true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };

  // TODO - Handle the activeUrl state
  const { activeUrl, setActiveUrl } = useWalletConnectManager();

  function handleUrl() {
    console.log("Location State " + location.state);
    if (location.state !== undefined) {
      const state = location.state as string;
    } else if (activeUrl !== "") {
      if (activeUrl !== "https://faucet.puzzle.online") {
        setUrl(activeUrl);
      }
    }
  }

  function handleDappSelection(url: string) {
    console.log("handleDappSelection", url);
    setUrl(url);
    setActiveUrl(url);
  }

  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/home");
  };
  React.useEffect(() => {
    handleUrl();
  }, []);

  /* --Event Listners */
  React.useEffect(() => {
    listen("reauthenticate", (event) => {
      setReauthDialogOpen(true);
    });
  }, []);
  if (
    location.state !== undefined &&
    location.state !== null &&
    location.state !== ""
  ) {
    return (
      <DashboardLayout>
        <ReAuthDialog
          isOpen={reauthDialogOpen}
          onRequestClose={() => {
            setReauthDialogOpen(false);
          }}
        />
        <ArrowBackIosNewIcon />
        <Browser
          initialUrl={location.state}
          handleDappSelection={handleDappSelection}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ReAuthDialog
        isOpen={reauthDialogOpen}
        onRequestClose={() => {
          setReauthDialogOpen(false);
        }}
      />
      <ArrowBackIosNewIcon
        sx={{
          minHeight: 48,
          px: 2.5,
          color: "#fff",
          "&:hover": {
            color: "#00FFAA",
          },
        }}
        onClick={() => {
          handleOnClick();
        }}
      />
      <Browser initialUrl={url} handleDappSelection={handleDappSelection} />
      <SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer}>
        <h1>Hello</h1>
      </SwipeableEdgeDrawer>
    </DashboardLayout>
  );
};

export default BrowserView;
