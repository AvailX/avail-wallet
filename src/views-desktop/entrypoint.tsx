import * as React from "react";
import * as mui from "@mui/material";
import { useNavigate } from "react-router-dom";
import { os } from "../services/util/open";

// Components
import UpdateDialog from "../components/dialogs/update";
import UpdateAlert from "../components/dialogs/update_alert";

// Services
import { session_and_local_auth } from "../services/authentication/auth";
import { relaunch } from "@tauri-apps/plugin-process";

// Images
import a_logo from "../assets/logo/aleo-logo.svg";

// Types
import { type AvailError, AvailErrorType } from "../types/errors";
import { type Update } from "@tauri-apps/plugin-updater";
// import Layout from './reusable/layout';

import { ErrorAlert } from "../components/snackbars/alerts";
import update from "../services/util/updater";
import { useWalletConnectManager } from "../context/WalletConnect";
import { listen } from "@tauri-apps/api/event";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";

import bgImg from "../assets/images/backgrounds/avail-gradients.png";

function Entrypoint() {
  const navigate = useNavigate();
  const shouldRunEffect = useRef(true);
  const [alert, setAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const { walletConnectManager } = useWalletConnectManager();
  const [updateDialog, setUpdateDialog] = useState<boolean>(false);

  const initDeepLink = async () => {
    await listen("deep-link-wc", async (event) => {
      const { uri } = event.payload as { uri: string }; // Add type assertion

      // Decode the uri
      const wcUri = uri.split('"')[1].split("avail://wc?uri=")[1];
      console.log("Deep link uri:", wcUri);
      const decodedUri = decodeURIComponent(wcUri);
      console.log("Decoded uri:", decodedUri);

      // If (decodedUri)
      await walletConnectManager.pair(decodedUri);
    });
  };

  useEffect(() => {
    // navigate('/register');
    if (shouldRunEffect.current) {
      update()
        .then(async (update_res) => {
          if (update_res?.available) {
            setUpdateDialog(true);
            update_res
              .downloadAndInstall()
              .then(() => {
                // Set alert with message that "There is an update in progess. Please wait app will restart." and a loading spinner
                setTimeout(async () => {
                  await relaunch();
                }, 2000);
              })
              .catch(() => {
                setUpdateDialog(false);
                setAlertMessage("Failed to download and install the update.");
                setAlert(true);
              });
          } else {
            await initDeepLink();
            setTimeout(() => {
              /* -- Local + Session Auth -- */
              session_and_local_auth(
                undefined,
                navigate,
                setAlert,
                setAlertMessage,
                true
              ).catch(async (error_) => {
                console.log(error_);
                const error = error_ as AvailError;
                if (error.error_type === AvailErrorType.Network) {
                  // TODO - Desktop login
                }
                if (error.error_type.toString() === "Unauthorized") {
                  navigate("/login");
                } else {
                  navigate("/register");
                }
              });
            }, 3000);
          }
        })
        .catch(() => {
          setAlertMessage("Failed to fetch latest update.");
          setAlert(true);
        });
      shouldRunEffect.current = false;
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "red",
        minHeight: "100vh",
        background: `url(${bgImg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UpdateAlert open={updateDialog} />
      <ErrorAlert
        errorAlert={alert}
        setErrorAlert={setAlert}
        message={alertMessage}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          height: "100vh",
          justifyContent: "center",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <img src={a_logo} alt="" style={{ width: "300px", alignSelf: "center" }} />
          <Typography color="#fff" fontSize="40px" mt={4} fontWeight={700}>
            Connecting to the{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                //@ts-ignore
                textFillColor: "transparent",
              }}
            >
              Aleo Blockchain...
            </span>
          </Typography>
          <CircularProgress
            sx={{ marginTop: "10px", color: "#00ffaa", top: 0 }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Entrypoint;
