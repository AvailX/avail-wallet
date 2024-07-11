import React from "react";
import * as mui from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import STButton from "../settings/settings-button";

import { TextField, Typography, Stack, Button } from "@mui/material";
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
import ViewKeyDialog from "../../components/dialogs/keys/get_viewing_key";
import SeedPhraseDialog from "../../../../src/components/dialogs/keys/get_seed_phrase";
import PrivateKeyDialog from "../../components/dialogs/keys/get_private_key";
import ReAuthDialog from "../../../../src/components/dialogs/reauth";

function KeysSettings() {
  const [success, setSuccess] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [info, setInfo] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

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
      <mui.Box
        sx={{
          mt: "2%",
          borderRadius: "10px",
          bgcolor: "#1E1D1D",
          justifyContent: "space-between",
          mb: "1%",
          alignItems: "center",
          position: "relative",
          padding: 2,
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Overlay with blur effect */}
        {!revealAll && (
          <mui.Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)", // Dark overlay
              backdropFilter: "blur(4px)", // Blur effect
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px", // Match the parent's border radius
            }}
          ></mui.Box>
        )}
        <SmallText400 sx={{ color: "#FFF" }}>{param}</SmallText400>
      </mui.Box>
    </mui.Box>
  );

  // const [publicKey, setPublicKey] = React.useState("");
  // const [privateKey, setPrivateKey] = React.useState("");

  return (
    <div>
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />
      <ViewKeyDialog
        isOpen={vkOpen}
        onRequestClose={() => {
          setVkOpen(false);
        }}
        setViewKey={setVk}
      />
      <PrivateKeyDialog
        isOpen={pkOpen}
        onRequestClose={() => {
          setPkOpen(false);
        }}
        setPrivateKey={setPk}
      />
      <Stack direction="column" spacing={2}>
        <Stack direction="column" spacing={0}>
          <Typography color="#fff" fontSize="15px" fontWeight={200}>
            Viewing Key
          </Typography>
          <HiddenItem param={vk} label="Viewing Key" />
        </Stack>
        <Stack direction="column" spacing={0}>
          <Typography color="#fff" fontSize="15px" fontWeight={200}>
            Private Key
          </Typography>
          {/* edit the hiddden Item to remove the dark box */}
          <HiddenItem param={pk} label="Private Key" />
        </Stack>
      </Stack>
    </div>
  );
}

export default KeysSettings;
