import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import * as mui from "@mui/material";
import { Box } from "@mui/material";

// Components
import { useLocation } from "react-router-dom";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MiniDrawer from "../../src-desktop/components/sidebar";
import ReAuthDialog from "../../src-desktop/components/dialogs/reauth";
// Tauri tools
import { listen } from "@tauri-apps/api/event";

import { useNavigate } from "react-router-dom";
// global state
import { useWalletConnectManager } from "../../src-desktop/context/WalletConnect";
import { Title2Text } from "../../src-desktop/components/typography/typography";

//imported from the mobile browser to aid editing
import Browser from "../browser/mobile_browser";
import RequestModal from "../components/RequestModal";
import BrowserLayout from "../layouts/BrowserLayout";

const BrowserView: React.FC = () => {
  const location = useLocation();

  const [url, setUrl] = React.useState("");
  const [reauthDialogOpen, setReauthDialogOpen] = React.useState(false);

  //Drawer
  const [open, setOpen] = React.useState<boolean>(false);

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
    // WCRequest
    listen("wallet-connect-request", (event) => {
      setOpen(true);
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
    <BrowserLayout>
      <Box height="90vh">
        <ReAuthDialog
          isOpen={reauthDialogOpen}
          onRequestClose={() => {
            setReauthDialogOpen(false);
          }}
        />
        <Browser initialUrl={url} handleDappSelection={handleDappSelection} />
        {/* <SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer}>
          <RequestModal closeModal={toggleDrawer(false)} request={} />
        </SwipeableEdgeDrawer> */}
      </Box>
    </BrowserLayout>
  );
};

export default BrowserView;
