import React from "react";
import { TextField, Typography, Stack, Button } from "@mui/material";

function SecretPhrase() {
  const [publicKey, setPublicKey] = React.useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "viewingkey") {
      setPublicKey(value);
    }
  };
  return (
    <Stack direction="column" spacing={0}>
      <Typography color="#fff" fontSize="15px" fontWeight={200}>
        Viewing Key
      </Typography>
      <TextField
        fullWidth
        value={publicKey}
        onChange={handleChange}
        name="viewingkey"
        sx={{ bgcolor: "#264139", borderRadius: "10px" }}
      />
    </Stack>
  );
}

export default SecretPhrase;
