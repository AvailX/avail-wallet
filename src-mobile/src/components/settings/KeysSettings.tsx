import React from "react";
import * as mui from "@mui/material";
import STButton from "../settings/settings-button";

import { Typography, Stack } from "@mui/material";
import { SmallText400 } from "../../../../src/components/typography/typography";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../../../src/components/snackbars/alerts";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ViewKeyDialog from "../../components/dialogs/keys/get_viewing_key";
import PrivateKeyDialog from "../../components/dialogs/keys/get_private_key";

function KeysSettings() {
  const [success, setSuccess] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  // Key states
  const [pk, setPk] = React.useState<string>("");
  const [vk, setVk] = React.useState<string>("");

  // Seed Phrase states
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
