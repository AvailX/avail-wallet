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
            <Stack direction="column" spacing={0}>
              <Typography color="#fff" fontSize="15px" fontWeight={200}>
                Username (optional)
              </Typography>
              <TextField
                name="username"
                value={username}
                onChange={handleChange}
                optional
                sx={{ bgcolor: "#264139", borderRadius: "10px" }}
              />
            </Stack>
            <FormControl fullWidth>
              <Typography color="#fff" fontSize="15px" fontWeight={200}>
                Language
              </Typography>
              <Select
                id="language"
                name="language"
                value={language}
                onChange={handleChange}
                label="Language"
                sx={{ bgcolor: "#264139", borderRadius: "10px" }}
              >
                {languages.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ color: "#264139", borderRadius: "10px" }}
                  >
                    {option.label}
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
              <Select
                id="network"
                name="network"
                value={network}
                onChange={handleChange}
                label="Network"
                sx={{ bgcolor: "#264139", borderRadius: "10px" }}
              >
                {networks.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="column" spacing={0}>
              <Typography color="#fff" fontSize="15px" fontWeight={200}>
                Address
              </Typography>
              <TextField
                name="address"
                placeholder="aleo10gv8wduhc9weciu89uw9..."
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
          {/* <Button variant="contained" type="submit">
            Save Changes
          </Button> */}
        </Stack>
      </form>
    </div>
  );
}

export default GeneralSettings;
