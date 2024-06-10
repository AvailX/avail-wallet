import React from "react";
import { TextField, Typography, Stack, Button } from "@mui/material";

function SecretPhrase() {
  const [publicKey, setPublicKey] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "publicKey") {
      setPublicKey(value);
    }
  };
  return (
    <Stack direction="column" spacing={1}>
      <Typography>Viewing Key</Typography>
      <TextField
        fullWidth
        value={publicKey}
        onChange={handleChange}
        name="viewingkey"
      />
    </Stack>
  );
}

export default SecretPhrase;
