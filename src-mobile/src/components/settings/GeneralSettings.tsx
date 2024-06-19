import React from "react";
import * as mui from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../../../../src/i18next-config";
import { languages } from "../../../../src/components/select/language";
import { updateUsername } from "../../../../src/services/storage/persistent";
import UsernameDialog from "../../../../src/components/dialogs/username";
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
      <Stack spacing={2}>
        <Stack direction="column" spacing={2}>
          <Stack direction="column" spacing={0}>
            {/* username dialogue is supposed to come here */}
            <UsernameDialog
              isOpen={UsernameDialogOpen}
              onRequestClose={() => {
                setUsernameDialogOpen(true);
              }}
              username={username}
              originalUsername={originalUsername}
            />
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
                    <mui.InputAdornment position="end">
                      <mui.IconButton
                        onClick={() => {
                          setUsernameDialogOpen(true);
                        }}
                        sx={{ color: "#fff" }}
                      >
                        <SaveIcon />
                      </mui.IconButton>
                    </mui.InputAdornment>
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
            <TextField
              name="address"
              value={address}
              // placeholder="aleo10gv8wduhc9weciu89uw9..."
              InputProps={{
                readOnly: true,
              }}
              sx={{
                bgcolor: "#264139",
                borderRadius: "10px",
                "& .MuiInputBase-placeholder": {
                  color: "#fff", // Change placeholder color to white
                },
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default GeneralSettings;
