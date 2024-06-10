import React from "react";
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

function GeneralSettings() {
  const [username, setUsername] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [network, setNetwork] = React.useState("");

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const networks = [
    { value: "testnet3", label: "Testnet 3" },
    { value: "mainnet", label: "Mainnet" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "language") {
      setLanguage(value);
    } else if (name === "network") {
      setNetwork(value);
    }
  };
  return (
    <div>
      <form>
        <Stack spacing={2}>
          <Stack direction="column" spacing={2}>
            <TextField
              label="Username (Optional)"
              name="username"
              value={username}
              onChange={handleChange}
              optional
            />
            <FormControl fullWidth>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                id="language"
                name="language"
                value={language}
                onChange={handleChange}
                label="Language"
              >
                {languages.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="column" spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="network-label">Network</InputLabel>
              <Select
                labelId="network-label"
                id="network"
                name="network"
                value={network}
                onChange={handleChange}
                label="Network"
              >
                {networks.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Address"
              name="address"
              placeholder="aleo10gv8wduhc9weciu89uw9..."
              disabled
            />
          </Stack>
          {/* <Button variant="contained" type="submit">
            Save Changes
          </Button> */}
        </Stack>
      </form>
    </div>
  );
}

export default GeneralSettings;
