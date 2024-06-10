import React from "react";
import { TextField, Typography, Stack, Button } from "@mui/material";

function KeysSettings() {
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
          Public Key
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
          Private Key
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

export default KeysSettings;
