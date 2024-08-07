import React, { type ReactEventHandler, useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import modallogo from "../assets/modal-logo.png";
import splashImg from "../assets/green-splash.svg";

import { type WalletConnectRequest } from "../../src-desktop/services/wallet-connect/WCTypes";
// Tauri tools
import { emitTo, listen, emit } from "@tauri-apps/api/event";

// global state
import { useTranslation } from "react-i18next";
import { useWalletConnectManager } from "../../src-desktop/context/WalletConnect";
import { useNavigate } from "react-router-dom";

type RequestModalProps = {
  closeModal: () => void;
  request: any;
};

const RequestModal: React.FC<RequestModalProps> = ({ closeModal, request }) => {
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

  // handling the state changes for the modal window
  const [action, setAction] = useState<"none" | "approve" | "reject">("none");

  // const handleAction = (actionType: "approve" | "reject") => {
  //   console.log(actionType);
  //   if (actionType === "approve") {
  //     // Add logic for approval which should be emititng the action
  //     console.log("Approved");
  //     // closeModal();
  //   } else {
  //     // Add logic for rejection which should be emmiting the action
  //     console.log("Rejected");
  //   }
  //   setAction("none");
  //   // closeModal();
  // };

  // const handleWCR = async () => {
  //   await emit("wallet-connect-request", {});
  //   console.log("Emitting wallet-connect-request");
  // };

  const [feeOption, setFeeOption] = useState(false);

  useEffect(() => {
  }, [request]);

  const handleApprove = async () => {
    const eventName = request.method + "-approved";
    const payload = { message: request.approveResponse };
    if (request.method === "create-request-event") {
      // payload["feeOption"] = feeOption;
      console.log("Approve");
    }
    await emit(eventName, payload);
    closeModal();
  };

  const handleReject = async () => {
    const eventName = request.method + "-rejected";
    await emit(eventName, { message: request.rejectResponse });
    closeModal();
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
          alt=""
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
          onClick={handleApprove}
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
          onClick={handleReject}
        >
          Reject
        </Button>
      </Box>
    </Box>
  );
};

export default RequestModal;
