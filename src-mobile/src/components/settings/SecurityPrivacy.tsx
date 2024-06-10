import React from "react";
import { TextField, Typography, Stack, Button } from "@mui/material";

function SecurityPrivacy() {
  const [publicKey, setPublicKey] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "publicKey") {
      setPublicKey(value);
    } else if (name === "privateKey") {
      setPrivateKey(value);
    }
  };
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={0}>
        <Typography color="#fff" fontSize="15px" fontWeight={200}>
          Privacy Policy
        </Typography>
        <TextField
          fullWidth
          value={publicKey}
          onChange={handleChange}
          name="publicKey"
          sx={{ bgcolor: "#264139", borderRadius: "10px" }}
        />
      </Stack>
      <Stack direction="column" spacing={0}>
        <Typography color="#fff" fontSize="15px" fontWeight={200}>
          Terms of Service
        </Typography>
        <TextField
          fullWidth
          disabled
          value={privateKey}
          name="privateKey"
          sx={{ bgcolor: "#264139", borderRadius: "10px" }}
        />
      </Stack>
      {/* <Button variant="outlined">View</Button> */}
    </Stack>
  );
}

export default SecurityPrivacy;
