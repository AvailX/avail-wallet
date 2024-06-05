import React, { type ReactEventHandler, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import modallogo from "../assets/modal-logo.png";
import splashImg from "../assets/green-splash.svg";

import { type WalletConnectRequest } from "../../../src/services/wallet-connect/WCTypes";
// Tauri tools
import { emitTo, listen, emit } from "@tauri-apps/api/event";

// global state
import { useTranslation } from "react-i18next";
import { useWalletConnectManager } from "../../../src/context/WalletConnect";
import { useNavigate } from "react-router-dom";

function RequestModal() {
  var DappName = "DappName";

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

  React.useEffect(() => {
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

  const handleWCR = async () => {
    await emit("wallet-connect-request", {});
    console.log("Emitting wallet-connect-request");
  };

  return (
    <Box display="flex" flexDirection="column" margin="0">
      <Box
        mx="auto"
        display="flex"
        alignItems="center"
        justifyContent="center"
        my={2}
      >
        <img
          src={modallogo}
          style={{
            paddingTop: "5px",
            width: "86px",
            height: "110px",
          }}
        />
      </Box>
      <Box justifyItems="center">
        <Typography
          fontSize="24px"
          mr={1}
          fontWeight={500}
          sx={{ color: "#fff" }}
        >
          {DappName} wants to connect
        </Typography>
        <Typography
          fontSize="20px"
          textAlign="center"
          // lineHeight="10px"
          mr={1}
          fontWeight={400}
          sx={{ color: "#767474" }}
        >
          What Data will be Shared if you connect*
        </Typography>
      </Box>
      <Box
        mx="auto"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        mt={2}
      >
        <Button
          sx={{
            background: "#225746",
            color: "#00FFAA",
            border: 0,
            py: 0.5,
            px: 2,
            m: 0,
            fontSize: 22,
          }}
          type="submit"
          aria-label="approve"
          onClick={() => {
            connected ? handleDisconnect() : handleConnected();
          }}
        >
          Approve
        </Button>
        <Button
          sx={{
            background: "#225746",
            color: "#00FFAA",
            border: 0,
            py: 0.5,
            px: 2,
            m: 0,
            fontSize: 22,
          }}
          type="submit"
          aria-label="approve"
        >
          Reject
        </Button>
      </Box>
    </Box>
  );
}

export default RequestModal;
