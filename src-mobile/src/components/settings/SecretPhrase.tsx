import React from "react";
import { TextField, Typography, Stack, Button } from "@mui/material";
import * as mui from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import STButton from "../settings/settings-button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Title2Text,
  SubMainTitleText,
  SubtitleText,
  BodyText,
  BodyText500,
  SmallText400,
} from "../../../../src/components/typography/typography";

import {
  ErrorAlert,
  SuccessAlert,
} from "../../../../src/components/snackbars/alerts";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteDialog from "../../../../src/components/dialogs/delete";
import ViewKeyDialog from "../../../../src/components/dialogs/keys/get_viewing_key";
import PrivateKeyDialog from "../../../../src/components/dialogs/keys/get_private_key";
import SeedPhraseDialog from "../../../../src/components/dialogs/keys/get_seed_phrase";
import ReAuthDialog from "../../../../src/components/dialogs/reauth";

function SecretPhrase() {
  const [success, setSuccess] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [info, setInfo] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [UsernameDialogOpen, setUsernameDialogOpen] = React.useState(false);

  // General States
  const [username, setUsername] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>("");
  const [network, setNetwork] = React.useState<string>("");
  const [address, setAddress] = React.useState<string>("");

  // Key states
  const [pk, setPk] = React.useState<string>("");
  const [vk, setVk] = React.useState<string>("");

  // Seed Phrase states
  const [seedPhrase, setSeedPhrase] = React.useState<string>("");
  const [revealAll, setRevealAll] = React.useState(false);

  // Advanced settings states
  const [lastSync, setLastSync] = React.useState<number>(0);
  const [backup, setBackup] = React.useState<boolean>(false);

  // Dialog states
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [vkOpen, setVkOpen] = React.useState(false);
  const [pkOpen, setPkOpen] = React.useState(false);
  const [spOpen, setSpOpen] = React.useState(false);
  const [reAuthDialog, setReAuthDialog] = React.useState(false);

  // Sign states
  const [signature, setSignature] = React.useState<string>("");
  const [signMessage, setSignMessage] = React.useState<string>("");

  // Verification states
  const [addressToVerify, setAddressToVerify] = React.useState<string>("");
  const [signatureToVerify, setSignatureToVerify] = React.useState<string>("");
  const [verificationMessage, setVerificationMessage] =
    React.useState<string>("");
  const [verifyResult, setVerifyResult] = React.useState<boolean>();

  const { t } = useTranslation();

  const handleCopyToClipboard = (parameter: string, label: string) => {
    navigator.clipboard.writeText(parameter);
    setMessage(label + " copied successfully!");
    setSuccess(true);
  };

  const HiddenItem: React.FC<{ param: string; label: string }> = ({
    param,
    label,
  }) => (
    <mui.Box>
      <mui.Box sx={{ display: "flex", flexDirection: "row" }}>
        <STButton
          text={param == "" ? "Get and Decrypt" : revealAll ? "Lock" : "Unlock"}
          onClick={
            param == ""
              ? () => {
                  label === "Private Key"
                    ? setPkOpen(true)
                    : label === "Viewing Key"
                      ? setVkOpen(true)
                      : setSpOpen(true);
                }
              : () => {
                  setRevealAll(!revealAll);
                }
          }
        />
        {param !== "" && (
          <mui.IconButton
            onClick={() => {
              handleCopyToClipboard(param, label);
            }}
            size="large"
            sx={{
              color: "#00FFAA",
              "&:hover": { bgcolor: mui.alpha("#3a3a3a", 0.8) },
            }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </mui.IconButton>
        )}
      </mui.Box>
    </mui.Box>
  );

  return (
    <div>
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <SeedPhraseDialog
        isOpen={spOpen}
        onRequestClose={() => {
          setSpOpen(false);
        }}
        setSeedPhrase={setSeedPhrase}
      />
      <Stack direction="column" spacing={0}>
        <Typography color="#fff" fontSize="15px" fontWeight={200}>
          Viewing Key
        </Typography>
        <HiddenItem param={seedPhrase} label="Secret Phrase" />
      </Stack>
    </div>
  );
}

export default SecretPhrase;
