import { Box, Input as TextField, Typography } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CropFreeIcon from "@mui/icons-material/CropFree";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getNetwork,
  get_address,
  getUsername,
} from "../../../../src/services/storage/persistent";

import {
  TransferRequest,
  TransferType,
} from "../../../../src/types/transfer_props/tokens";
import { transfer } from "../../../../src/services/transfer/transfers";

import { getTokenBalance } from "../../../../src/services/states/utils";

import { emit, listen } from "@tauri-apps/api/event";

import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useTranslation } from "react-i18next";
import { AvailError } from "../../../../src/types/errors";

import {
  ErrorAlert,
  InfoAlert,
  SuccessAlert,
  WarningAlert,
} from "../../../../src/components/snackbars/alerts";

import TransferDialog from "../../../../src/components/dialogs/transfer";
import TransferInProgressDialog from "../../../../src/components/dialogs/transfer_in_progress";

import aleo from "../../../../src/assets/icons/tokens/aleo.svg";
import { Button } from "@mui/material";

const tokens = [
  {
    symbol: "ALEO",
    image_url: aleo,
  },
];

const mockTransferRequest: TransferRequest = {
  asset_id: "ALEO",
  amount: 10,
  recipient: "test",
  transfer_type: TransferType.TransferPublic,
  message: "test",
  fee_private: false,
  password: undefined,
  fee: 290_000,
};

function Send() {
  const [address, setAddress] = useState<string>("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [response, setResponse] = React.useState<string>();
  const [biometric, setBiometric] = React.useState<boolean>(false);

  // Balance states
  const [privateBalance, setPrivateBalance] = React.useState<number>(0);
  const [publicBalance, setPublicBalance] = React.useState<number>(0);

  // Transfer states
  const [token, setToken] = React.useState<string>("ALEO");
  const [recipient, setRecipient] = React.useState<string>("");
  const [amount, setAmount] = React.useState<number>(0);
  const [transferMessage, setTransferMessage] = React.useState<string>("");
  // const [request, setRequest] =
  //   React.useState<TransferRequest>(mockTransferRequest);
  const [TransferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [TransferInProgressDialogOpen, setTransferInProgressDialogOpen] =
    React.useState(false);

  // Privacy flags
  const [isPrivateTransferFrom, setIsPrivateTransferFrom] =
    React.useState(false);
  const [isPrivateTransferTo, setIsPrivateTransferTo] = React.useState(false);
  const [isPrivateFee, setIsPrivateFee] = React.useState(false);
  const [request, setRequest] =
    React.useState<TransferRequest>(mockTransferRequest);

  // Alert states
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [successAlert, setSuccessAlert] = React.useState(false);
  const [warningAlert, setWarningAlert] = React.useState(false);
  const [infoAlert, setInfoAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // Profile  bar states
  const [username, setUsername] = React.useState("");
  const [network, setNetwork] = React.useState("");

  // Scan states

  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    // Set network

    getNetwork()
      .then((res) => {
        setNetwork(res);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to get network.");
        setErrorAlert(true);
      });

    // Set address
    get_address()
      .then((res) => {
        console.log("This is my address", res);
        setAddress(res);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to get address.");
        setErrorAlert(true);
      });

    // Set username
    getUsername()
      .then((res) => {
        setUsername(res);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to get username.");
        setErrorAlert(true);
      });
  }, []);

  /* --Event Listners */
  React.useEffect(() => {
    const unlistenTx = listen("tx_in_progress_notification", (event) => {
      setTransferInProgressDialogOpen(true);
    });

    return () => {
      unlistenTx
        .then((remove) => {
          remove();
        })
        .catch((error) => {
          console.log(error);
          setMessage("Error listening to tx_in_progress_notification event.");
          setErrorAlert(true);
        });
    };
  }, []);

  const handleTransfer = async () => {
    let transferType: TransferType;

    if (isPrivateTransferFrom && isPrivateTransferTo) {
      transferType = TransferType.TransferPrivate;
    } else if (isPrivateTransferFrom && !isPrivateTransferTo) {
      transferType = TransferType.TransferPrivateToPublic;
    } else if (!isPrivateTransferFrom && isPrivateTransferTo) {
      transferType = TransferType.TransferPublicToPrivate;
    } else {
      transferType = TransferType.TransferPublic;
    }

    if (amount === undefined || recipient === "" || token === "") {
      setMessage(t("send.messages.error.fields"));
      setErrorAlert(true);
      return;
    }

    if (amount === 0) {
      setMessage(t("send.messages.error.zero-amount"));
      setErrorAlert(true);
      return;
    }

    if (amount < 0) {
      setMessage(t("send.messages.error.positive-amount"));
      setErrorAlert(true);
      return;
    }

    if (amount > privateBalance && isPrivateTransferFrom) {
      setMessage(t("send.messages.error.insufficient-private-amount"));
      setErrorAlert(true);
      return;
    }

    if (amount > publicBalance && !isPrivateTransferFrom) {
      setMessage(t("send.messages.error.insufficient-public-amount"));
      setErrorAlert(true);
      return;
    }

    let asset_id = token;

    if (token === "ALEO") {
      asset_id = "credits";
    }

    const request: TransferRequest = {
      asset_id,
      amount: amount * 1_000_000,
      recipient,
      transfer_type: transferType,
      message: transferMessage,
      fee_private: isPrivateFee,
      password: undefined,
      fee: 297_000,
    };

    sessionStorage.setItem("transferState", "true");
    transfer(request, setErrorAlert, setMessage)
      .then((res) => {
        sessionStorage.setItem("transferState", "false");
      })
      .catch(async (err) => {
        console.log(err);
        const error = err as AvailError;

        sessionStorage.setItem("transferState", "false");
        if (error.error_type.toString() === "Unauthorized") {
          sessionStorage.setItem("transferState", "false");
          await emit("transfer_off");

          setRequest(request);
          setTransferDialogOpen(true);
        }
        // TODO - Handle insufficient balance error
      });
  };

  const shouldRunEffect = React.useRef(true);
  React.useEffect(() => {
    let assetId = token;

    if (token === "ALEO") {
      assetId = "credits";
    }

    getTokenBalance(assetId)
      .then((res) => {
        if (res.balances !== undefined) {
          console.log("This is my balance");
          const balances = res.balances[0];
          setPrivateBalance(balances.private);
          setPublicBalance(balances.public);
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to get token balances.");
        setErrorAlert(true);
      });
  }, [token]);

  const handleEnterPress = () => {
    console.log("Enter key pressed! Address:", address);
    navigate("/input-send", { state: { address1: address } });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEnterPress();
    }
  };

  return (
    <DashboardLayout>
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
      <SuccessAlert
        successAlert={successAlert}
        setSuccessAlert={setSuccessAlert}
        message={message}
      />
      <WarningAlert
        warningAlert={warningAlert}
        setWarningAlert={setWarningAlert}
        message={message}
      />
      <InfoAlert
        infoAlert={infoAlert}
        setInfoAlert={setInfoAlert}
        message={message}
      />

      {/* TransferInProgress Dialog */}
      <TransferInProgressDialog
        isOpen={TransferInProgressDialogOpen}
        onRequestClose={() => {
          setTransferInProgressDialogOpen(false);
        }}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={TransferDialogOpen}
        onRequestClose={() => {
          setTransferDialogOpen(false);
        }}
        request={request}
      />
      <Box>
        <Typography
          color='#00FFAA'
          textAlign='center'
          fontSize='25px'
          fontWeight={700}
        >
          Send
        </Typography>

        <TextField
          fullWidth
          placeholder='Search avail user or aleo address '
          onChange={(e) => setAddress(e?.target?.value)}
          onKeyDown={handleKeyDown}
          startAdornment={<SearchIcon sx={{ color: "#fff", mr: 2 }} />}
          endAdornment={<CropFreeIcon sx={{ color: "#fff", mr: 2 }} />}
          disableUnderline
          inputProps={{
            sx: {
              "&::placeholder": {
                color: "#676767",
                opacity: 1,
              },
              color: "#fff",
            },
          }}
          sx={{
            border: "1px solid #00FFAA",
            borderRadius: "10px",
            p: 2,
            mt: 4,
          }}
        />

        <Button
          fullWidth
          onClick={handleEnterPress}
          sx={{
            position: "absolute",
            bottom: "1vh",
            left: 0,
            py: 2,
          }}
        >
          Send
        </Button>
      </Box>
    </DashboardLayout>
  );
}

export default Send;
