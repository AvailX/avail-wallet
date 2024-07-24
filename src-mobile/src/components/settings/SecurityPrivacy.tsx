import React from "react";
import { useNavigate } from "react-router-dom";

import { TextField, Typography, Stack, Button } from "@mui/material";

function SecurityPrivacy() {
  const navigate = useNavigate();
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={0}>
        <Typography color="#fff" fontSize="15px" fontWeight={200}>
          Privacy Policy
        </Typography>
        <Button
          fullWidth
          sx={{
            bgcolor: "#264139",
            border: "0px",
            color: "#fff",
            // my: 2,
            borderRadius: "10px",
          }}
          onClick={() => {
            navigate("/privacy-policy");
          }}
        >
          Privacy Policy
        </Button>
      </Stack>
      <Stack direction="column" spacing={0}>
        <Typography color="#fff" fontSize="15px" fontWeight={200}>
          Terms of Service
        </Typography>
        {/* <TextField
          fullWidth
          disabled
          name="privateKey"
          sx={{ bgcolor: "#264139", borderRadius: "10px" }}
        /> */}
        <Button
          fullWidth
          sx={{
            bgcolor: "#264139",
            border: "0px",
            color: "#fff",
            // my: 2,
            borderRadius: "10px",
          }}
          onClick={() => {
            navigate("/terms-of-service");
          }}
        >
          Terms of Service
        </Button>
      </Stack>
    </Stack>
  );
}

export default SecurityPrivacy;
