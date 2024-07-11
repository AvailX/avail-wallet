import React from "react";
import * as mui from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../../../../src/i18next-config";
import { languages } from "../../../../src/components/select/language";
// import { updateUsername } from "../../../../src/services/storage/persistent";
import UsernameDialog from "../../../../src/components/dialogs/username";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Stack,
  Button,
  InputLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../../../src/components/snackbars/alerts";
import {
  getUsername,
  updateUsername,
  get_address,
  getLastSync,
  getLanguage,
  getNetwork,
  updateBackupFlag,
  getBackupFlag,
} from "../../../../src/services/storage/persistent";
import DeleteDialog from "../../../../src/components/dialogs/delete";
import ViewKeyDialog from "../../../../src/components/dialogs/keys/get_viewing_key";
import PrivateKeyDialog from "../../../../src/components/dialogs/keys/get_private_key";
import SeedPhraseDialog from "../../../../src/components/dialogs/keys/get_seed_phrase";
import ReAuthDialog from "../../../../src/components/dialogs/reauth";

type Language = {
  symbol: string;
  name: string;
};
const GeneralSettings: React.FC<{
  username: string;
  setUsername: (username: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  network: string;
  address: string;
}> = ({ username, setUsername, network, address }) => {
  const [language, setLanguage] = React.useState<Language>({
    symbol: "en",
    name: "English",
  });
  const [success, setSuccess] = React.useState<boolean>(false);
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [originalUsername, setOriginalUsername] = React.useState(username);
  const [UsernameDialogOpen, setUsernameDialogOpen] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [vkOpen, setVkOpen] = React.useState(false);
  const [pkOpen, setPkOpen] = React.useState(false);
  const [spOpen, setSpOpen] = React.useState(false);
  const [reAuthDialog, setReAuthDialog] = React.useState(false);

  const { t } = useTranslation();

  // Handlers for change events
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleCopyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setMessage(address + " copied successfully!");
    setSuccess(true);
  };

  const handleLanguageChange = (event: mui.SelectChangeEvent) => {
    // SetLanguage(event.target.value as string);
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
  };

  React.useEffect(() => {
    setOriginalUsername(username);
    const lng = i18n.language;
    const selectedLanguage = languages.find((lang) => lang.symbol === lng);
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, []);

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
      <DeleteDialog
        isOpen={deleteOpen}
        onRequestClose={() => {
          setDeleteOpen(false);
        }}
      />
      <ReAuthDialog
        isOpen={reAuthDialog}
        onRequestClose={() => {
          setReAuthDialog(false);
        }}
      />
      <UsernameDialog
        isOpen={UsernameDialogOpen}
        onRequestClose={() => {
          setUsernameDialogOpen(false);
        }}
        username={username}
        originalUsername={originalUsername}
      />
      <Stack spacing={2}>
        <Stack direction="column" spacing={2}>
          <Stack direction="column" spacing={0}>
            {/* username dialogue is supposed to come here */}
            <Typography color="#fff" fontSize="15px" fontWeight={200}>
              Username (optional)
            </Typography>
            <TextField
              name="username"
              value={username}
              onChange={handleUsernameChange}
              sx={{ bgcolor: "#264139", borderRadius: "10px" }}
              InputProps={{
                endAdornment:
                  username === originalUsername ? null : (
                    <mui.IconButton
                      onClick={() => {
                        setUsernameDialogOpen(true);
                      }}
                      sx={{ color: "#fff" }}
                    >
                      <SaveIcon fontSize="medium" />
                    </mui.IconButton>
                  ),
              }}
            />
          </Stack>
          <FormControl fullWidth>
            <Typography color="#fff" fontSize="15px" fontWeight={200}>
              Language
            </Typography>
            <Select
              id="language"
              name="language"
              value={language.symbol}
              onChange={handleLanguageChange}
              label="Language"
              sx={{ bgcolor: "#264139", borderRadius: "10px" }}
            >
              {languages.map((option) => (
                <MenuItem
                  key={option.symbol}
                  value={option.symbol}
                  sx={{ color: "#264139", borderRadius: "10px" }}
                >
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="column" spacing={2}>
          <FormControl fullWidth>
            <Typography color="#fff" fontSize="15px" fontWeight={200}>
              Network
            </Typography>
            <TextField
              id="network"
              name="network"
              value={network}
              InputProps={{
                readOnly: true,
              }}
              label="Network"
              sx={{ bgcolor: "#264139", borderRadius: "10px" }}
            />
          </FormControl>
          <Stack direction="column" spacing={0}>
            <Typography color="#fff" fontSize="15px" fontWeight={200}>
              Address
            </Typography>
            <Stack direction="row" spacing={0}>
              <TextField
                name="address"
                value={address}
                // placeholder="aleo10gv8wduhc9weciu89uw9..."
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <mui.IconButton
                      onClick={() => handleCopyToClipboard(address)}
                      size="large"
                      sx={{
                        color: "#00FFAA",
                        "&:hover": { bgcolor: "#3a3a3a" },
                        marginRight: "-12px",
                      }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </mui.IconButton>
                  ),
                }}
                fullWidth
                disabled
                sx={{
                  bgcolor: "#264139",
                  borderRadius: "10px",
                  "& .MuiInputBase-placeholder": {
                    color: "#fff", // Change placeholder color to white
                  },
                }}
              />
              {/* <mui.IconButton
                onClick={() => {
                  handleCopyToClipboard(address);
                }}
                size="large"
                sx={{
                  color: "#00FFAA",
                  "&:hover": { bgcolor: mui.alpha("#3a3a3a", 0.8) },
                }}
              >
                <ContentCopyIcon fontSize="inherit" />
              </mui.IconButton> */}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default GeneralSettings;
