import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import aleoGreen from "../../assets/alo-green.svg";
import recipientDown from "../../assets/recipient-down.svg";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLocation } from "react-router-dom";

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

import {
  ErrorAlert,
  InfoAlert,
  SuccessAlert,
  WarningAlert,
} from "../../../../src/components/snackbars/alerts";

import TransferDialog from "../../../../src/components/dialogs/transfer";
import TransferInProgressDialog from "../../../../src/components/dialogs/transfer_in_progress";

import React from "react";
import { useTranslation } from "react-i18next";
import { AvailError } from "../../../../src/types/errors";

import aleo from "../../../../src/assets/icons/tokens/aleo.svg";

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

function InputRecipient() {
  const location = useLocation();
  const { address1 } = location.state || {};

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

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // setRecipient(address);
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
        // ! HERE I am trying to send to my own address, will need to be changed
        setRecipient(res);
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

  const { t } = useTranslation();

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
      console.log("Log empty fields", {
        amount,
        recipient,
        token,
      });
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
        setIsLoading(true);
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
      })
      .finally(() => {
        setIsLoading(false);
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
          console.log("This is my balance", res.balances);
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
  return (
    <DashboardLayout>
      <Box pt={2}>
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
      </Box>

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
        <Box>
          <Box
            bgcolor='#264139'
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            height='130px'
            px={3}
            mb={-2}
            borderRadius='9px'
          >
            <Box textAlign='left'>
              <Typography fontSize='30px' color='#B6B6B6' fontWeight={400}>
                {969.0}
              </Typography>
              <Typography color='#969696'>$6,749.30</Typography>
            </Box>
            <Box>
              <img src={aleoGreen} />
              <Typography fontWeight={700} fontSize='15px' color='#B6B6B6'>
                Balance: {publicBalance}
              </Typography>
            </Box>
          </Box>
          <Box
            mx='auto'
            display='flex'
            alignItems='center'
            justifyContent='center'
            zIndex={100}
          >
            <img src={recipientDown} />
          </Box>
          <Box
            bgcolor='#264139'
            display='flex'
            alignItems='center'
            justifyContent='center'
            height='130px'
            zIndex={-1}
            mt={-2}
            borderRadius='9px'
          >
            <Typography fontSize='20px' fontWeight={700}>
              {address || "No address found."}
            </Typography>
          </Box>
        </Box>

        <TextButtons setAmount={setAmount} />

        <Button
          onClick={async () => {
            await handleTransfer();
          }}
          sx={{
            width: "100%",
            border: "0px",
            bgcolor: "#264139",
            color: isLoading ? "#000" : "#00FFAA",
            mb: 7,
          }}
        >
          Send
        </Button>
      </Box>
    </DashboardLayout>
  );
}

const TextButtons = ({
  setAmount,
}: {
  setAmount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const buttonText = [
    { text: "1", value: 1 },
    { text: "2", value: 2 },
    { text: "3", value: 3 },
    { text: "4", value: 4 },
    { text: "5", value: 5 },
    { text: "6", value: 6 },
    { text: "7", value: 7 },
    { text: "8", value: 8 },
    { text: "9", value: 9 },
    { text: ".", value: "." },
    { text: "0", value: 0 },
    {
      text: "B",
      value: <ArrowBackIcon sx={{ color: "#fff", fontSize: "40px" }} />,
    },
  ];
  const [text, setText] = useState<string>("");
  const handleButtonClick = (value: string) => {
    if (value === "." && text.includes(".")) {
      return;
    }
    if (value === "B") {
      setText(text.slice(0, -1));
    } else {
      setText(text + value);
    }
  };

  useEffect(() => {
    setAmount(+text);
  }, [text]);

  return (
    <>
      <h1 style={{ color: "yellow" }}>{text}</h1>
      <Box
        width='100%'
        display='grid'
        gridTemplateColumns='1fr 1fr 1fr'
        gap='5px'
        my={5}
      >
        {buttonText.map(({ text, value }) => (
          <Box
            key={text}
            display='flex'
            alignItems='center'
            onClick={() => handleButtonClick(text)}
            justifyContent='center'
            sx={{ cursor: "pointer" }}
          >
            <Typography fontSize='40px' fontWeight={500} textAlign='center'>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default InputRecipient;
