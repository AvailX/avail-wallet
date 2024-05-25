import React, { type ReactEventHandler, useState } from "react";
import { type WalletConnectRequest } from "../../../src/services/wallet-connect/WCTypes";
// Tauri tools
import { emitTo, listen, emit } from "@tauri-apps/api/event";

// Styles
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Paper,
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";

// global state
import { useTranslation } from "react-i18next";
import { useWalletConnectManager } from "../../../src/context/WalletConnect";
import DappView from "../../../src/components/dApps/dapp";
import { Title2Text } from "../../../src/components/typography/typography";
import { dapps } from "../../../src/assets/dapps/dapps";
import { useScan } from "../../../src/context/ScanContext";

// Alerts
import {
  ErrorAlert,
  SuccessAlert,
  WarningAlert,
  InfoAlert,
} from "../../../src/components/snackbars/alerts";
import { open_url } from "../../../src/services/util/open";
import { useNavigate } from "react-router-dom";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  marginLeft: 0,
  width: "60%",
}));

type BrowserProperties = {
  initialUrl?: string;
  theme?: "dark" | "light";
  handleDappSelection: (url: string) => void;
};

const Browser: React.FC<BrowserProperties> = ({
  initialUrl,
  theme = "light",
  handleDappSelection,
}) => {
  const [url, setUrl] = useState<string | undefined>(initialUrl ?? "");
  const [inputUrl, setInputUrl] = useState(url);
  const [previousUrls, setPreviousUrls] = useState<string[]>([]);
  const [wcUrl, setWcUrl] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Alert states
  const [errorAlert, setErrorAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [warningAlert, setWarningAlert] = useState(false);
  const [infoAlert, setInfoAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const { walletConnectManager } = useWalletConnectManager();

  const { t } = useTranslation();

  const handleConnected = () => {
    walletConnectManager.pair(wcUrl).catch(() => {
      setAlertMessage("Error connecting");
      setErrorAlert(true);
    });
    sessionStorage.setItem("connected", "true");
  };

  const getConnectState = () => {
    const connected = sessionStorage.getItem("connected");
    if (connected === "true") {
      return true;
    }

    return false;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(event.target.value);
  };

  const handleInputWcUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWcUrl(event.target.value);
  };

  const handleDisconnect = () => {
    walletConnectManager
      .close()
      .then(() => {
        sessionStorage.setItem("connected", "false");
        setConnected(false);
        setAlertMessage(t("browser.message.success.disconnect"));
        setSuccessAlert(true);
      })
      .catch((error) => {
        setConnected(false);
        sessionStorage.setItem("connected", "false");
        setAlertMessage("Error disconnecting ");
        setErrorAlert(true);
      });
  };

  const handleBack = () => {
    setUrl(previousUrls.at(-1));
    setInputUrl(previousUrls.at(-1));
    setPreviousUrls(previousUrls.slice(0, -1));

    if (previousUrls.length === 0) {
      setInputUrl("");
      setUrl("");
      sessionStorage.removeItem("activeUrl");
      navigate("/dapps");
    }
  };

  const handleReload = () => {
    // Logic for reload action
    setUrl(inputUrl);
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = inputUrl || "";
    }
  };

  function handleUrlChangeInIframe(): ReactEventHandler<HTMLIFrameElement> {
    return (event) => {
      // if url starts with avail:// open in native app
      console.log("rip");
      const iframe = event.target as HTMLIFrameElement;
      const url = iframe.contentWindow?.location.href;
      if (url && url.startsWith("avail://")) {
        event.preventDefault();
        open_url(url);
      }
    };
  }

  const handleDappSelect = (url: string) => {
    setInputUrl(url);
    setUrl(url);
    setShowMenu(false);

    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = url;
      if (url !== "https://faucet.puzzle.online") {
        sessionStorage.setItem("activeUrl", url);
      }
    }
  };

  React.useEffect(() => {
    // Check for active url in session storage
    const activeUrl = sessionStorage.getItem("activeUrl");
    console.log("activeUrl", activeUrl);
    if (activeUrl && activeUrl !== "https://faucet.puzzle.online") {
      setUrl(activeUrl);
      setInputUrl(activeUrl);
    }

    const connected = getConnectState();
    setConnected(connected);

    const unlistenConnected = listen("connected", (event) => {
      setConnected(true);
    });

    const unlistenDisconnected = listen("disconnected", (event) => {
      setConnected(false);
    });

    return () => {
      unlistenConnected
        .then((remove) => {
          remove();
        })
        .catch((error) => {
          console.log(error);
        });

      unlistenDisconnected
        .then((remove) => {
          remove();
        })
        .catch((error) => {
          console.log(error);
        });
    };
  }, []);

  const wcRequest: WalletConnectRequest = {
    method: "connect",
    question: "Do you want to connect to " + "metadata.name" + " ?",
    imageRef: "../wc-images/connect.svg",
    approveResponse: "User approved wallet connect",
    rejectResponse: "User rejected wallet connect",
    description: "metadata.description",
    dappUrl: "",
    dappImage: "metadata.icons[0]",
  };

  const handleWCR = async () => {
    await emit("wallet-connect-request", {});
    console.log("Emitting wallet-connect-request");
  };

  return (
    <Box sx={{}}>
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={alertMessage}
      />
      <SuccessAlert
        successAlert={successAlert}
        setSuccessAlert={setSuccessAlert}
        message={alertMessage}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pt={1}
        pb={2}
        m={0}
      >
        <IconButton
          edge="start"
          color="inherit"
          size="small"
          sx={{ mr: 2 }}
          aria-label="back"
          onClick={handleBack}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="reload"
          edge="start"
          size="small"
          sx={{ mr: 2 }}
          onClick={handleReload}
        >
          <RefreshIcon />
        </IconButton>
        {/* <IconButton onClick={handleWCR}>
          <p>connect</p>
        </IconButton> */}
      </Box>
      <Box>
        <Typography>
          Due to the instability of ALEO official test network nodes,
          transactions may fail
        </Typography>
        <IconButton>
          <p>X</p>
        </IconButton>
      </Box>
      <Box>
        <p>Image</p>
        <IconButton>Connect Wallet</IconButton>
      </Box>
      <Box
        sx={{
          p: "20px",
        }}
      >
        {url !== "" && (
          <iframe
            src={url}
            title="Browser"
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            allow="clipboard-read; clipboard-write"
          />
        )}
      </Box>
    </Box>
  );
};

export default Browser;
