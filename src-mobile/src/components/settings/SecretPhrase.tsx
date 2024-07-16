import React from "react";
import { Typography, Stack } from "@mui/material";
import * as mui from "@mui/material";
import STButton from "../settings/settings-button";
import { SmallText400 } from "../../../../src/components/typography/typography";

import {
  ErrorAlert,
  SuccessAlert,
} from "../../../../src/components/snackbars/alerts";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SeedPhraseDialog from "../../components/dialogs/keys/get_seed_phrase";

function SecretPhrase() {
  const [success, setSuccess] = React.useState<boolean>(false);

  const [message, setMessage] = React.useState<string>("");
  const [errorAlert, setErrorAlert] = React.useState(false);

  // Seed Phrase states
  const [seedPhrase, setSeedPhrase] = React.useState<string>("");
  const [revealAll, setRevealAll] = React.useState(false);
  // Dialog states
  const [vkOpen, setVkOpen] = React.useState(false);
  const [pkOpen, setPkOpen] = React.useState(false);
  const [spOpen, setSpOpen] = React.useState(false);

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
              bgcolor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
            }}
          ></mui.Box>
        )}
        <SmallText400 sx={{ color: "#FFF" }}>{param}</SmallText400>
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
