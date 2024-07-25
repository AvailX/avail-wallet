import React, { type ReactEventHandler, useState } from "react";
import { type WalletConnectRequest } from "../../src-desktop/services/wallet-connect/WCTypes";
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
  Stack,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { styled } from "@mui/material/styles";
// import arcane from "../assets/arcane.svg";
// import SegmentIcon from "@mui/icons-material/Segment";
// import CloseIcon from "@mui/icons-material/Close";
// import LoopIcon from "@mui/icons-material/Loop";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// global state
import { useTranslation } from "react-i18next";
import { useWalletConnectManager } from "../../src-desktop/context/WalletConnect";
import DappView from "../../src-desktop/components/dApps/dapp";
import { Title2Text } from "../../src-desktop/components/typography/typography";
import { dapps } from "../../src-desktop/assets/dapps/dapps";
import { useScan } from "../../src-desktop/context/ScanContext";

// Alerts
import {
  ErrorAlert,
  SuccessAlert,
  WarningAlert,
  InfoAlert,
} from "../../src-desktop/components/snackbars/alerts";
import { open_url } from "../../src-desktop/services/util/open";
import { useNavigate } from "react-router-dom";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  marginLeft: 0,
  width: "100%",
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

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputUrl && inputUrl !== url && inputUrl !== "") {
      let urlModified = inputUrl;

      if (!inputUrl.startsWith("https://") && !inputUrl.startsWith("http://")) {
        urlModified = "https://" + inputUrl;
      }

      setPreviousUrls([...previousUrls, url ?? ""]);
      setUrl(urlModified);
      setShowMenu(false);

      if (urlModified !== "https://faucet.puzzle.online") {
        sessionStorage.setItem("activeUrl", urlModified);
      }
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

  // const wcRequest: WalletConnectRequest = {
  //   method: "connect",
  //   question: "Do you want to connect to " + "metadata.name" + " ?",
  //   imageRef: "../wc-images/connect.svg",
  //   approveResponse: "User approved wallet connect",
  //   rejectResponse: "User rejected wallet connect",
  //   description: "metadata.description",
  //   dappUrl: "",
  //   dappImage: "metadata.icons[0]",
  // };

  // const handleWCR = async () => {
  //   await emit("wallet-connect-request", {});
  //   console.log("Emitting wallet-connect-request");
  // };

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
      {/* <Box display="flex" alignItems="center" pt={1} pb={2} m={0}>
        <IconButton
          sx={{
            background: " #3E3E3E",
            border: 0,
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            p: 0,
            ml: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          type="submit"
          aria-label="back"
          onClick={handleBack}
        >
          <ArrowBackIosNewIcon sx={{ color: "#BDBDBD" }} fontSize="small" />
        </IconButton>
        <IconButton
          sx={{
            background: " #3E3E3E",
            border: 0,
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            p: 0,
            mx: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          type="submit"
          aria-label="back"
          onClick={handleReload}
        >
          <LoopIcon sx={{ color: "#BDBDBD" }} fontSize="small" />
        </IconButton>
        <IconButton
          sx={{
            background: " #3E3E3E",
            border: 0,
            p: 0,
            width: "35px",
            height: "35px",
            mx: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleWCR}
        >
          <PlayArrowIcon />
        </IconButton>
        <IconButton
          sx={{
            background: " #3E3E3E",
            border: 0,
            p: 0,
            width: "35px",
            height: "35px",
            mx: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            handleDappSelect("https://app.arcane.finance");
            handleDappSelection("https://app.arcane.finance");
          }}
        >
          <PlayArrowIcon />
        </IconButton>
      </Box> */}
      <AppBar position="static" sx={{ bgcolor: "#111111" }}>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
            sx={{ color: "white" }}
          // onClick={() => navigate("/wallet-connect")}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="reload"
            onClick={handleReload}
            sx={{ color: "white" }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Box sx={{ width: "70%" }}>
            <Paper
              component="form"
              sx={{
                height: "35px",
                p: "2px 2px",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
              onSubmit={handleInputSubmit}
            >
              <InputBase
                sx={{
                  ml: 0.5,
                  flex: 1,
                  "& input::placeholder": {
                    fontSize: "14px",
                  },
                }}
                placeholder={t("browser.enter") + " Wallet Connect Link"}
                inputProps={{ "aria-label": "enter url" }}
                value={wcUrl}
                onChange={handleInputWcUrl}
              />
            </Paper>
          </Box>
          <Button
            sx={{
              borderRadius: "10px",
              width: "20%",
              bgcolor: "#00FFAA",
              color: "#111111",
              transition:
                "transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#00FFAA",
                boxShadow: "0 0 8px 2px rgba(0, 255, 170, 0.6)",
                transform: "scale(1.03)",
              },
              "&:focus": {
                backgroundColor: "#00FFAA",
                boxShadow: "0 0 8px 2px rgba(0, 255, 170, 0.8)",
              },
            }}
            onClick={() => {
              connected ? handleDisconnect() : handleConnected();
            }}
          >
            {connected
              ? t("browser.message.success.disconnect")
              : t("browser.connect")}
          </Button>
        </Stack>
        {/* <Toolbar variant="dense"> */}
        {/* <Search> */}
        {/* <Paper
              component="form"
              sx={{
                p: "2px 2px",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
              onSubmit={handleInputSubmit}
            >
              <InputBase
                sx={{
                  ml: 0.5,
                  height: "30px",
                  flex: 1,
                  "& input::placeholder": {
                    fontSize: "14px",
                  },
                }}
                placeholder={t("browser.enter") + " URL"}
                inputProps={{ "aria-label": "enter url" }}
                value={inputUrl}
                onChange={handleInputChange}
              />
            </Paper> */}
        {/* </Search> */}
        {/* </Toolbar> */}
      </AppBar>
      <Box
        sx={{
          height: "80vh",
          width: "100%",
        }}
      >
        {url !== "" && (
          <iframe
            src={url}
            title="Browser"
            width="100%"
            height="100%"
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen
            allow="clipboard-read; clipboard-write"
          />
        )}
        {url === "" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: "20px",
              ml: "2%",
            }}
          >
            <Title2Text sx={{ color: "#fff" }}>
              {" "}
              {t("browser.title")}{" "}
            </Title2Text>
            <Typography variant="body1" sx={{ color: "#a3a3a3" }}>
              {t("browser.subtitle")}
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{ marginTop: "20px", alignItems: "center" }}
            >
              {dapps.map((dapp, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <DappView
                    dapp={dapp}
                    onClick={() => {
                      handleDappSelect(dapp.url);
                      handleDappSelection(dapp.url);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Browser;
