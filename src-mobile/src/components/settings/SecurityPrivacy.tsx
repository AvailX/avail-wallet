import React from "react";
import { useNavigate } from "react-router-dom";

import { TextField, Typography, Stack, Button } from "@mui/material";

function SecurityPrivacy() {
  const navigate = useNavigate();
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={0}>
        <Typography
          color="#fff"
          fontSize="15px"
          fontWeight={200}
          onClick={() => {
            navigate("/privacy-policy");
          }}
        >
          Privacy Policy
        </Typography>
        {/* <Button
          fullWidth
          onClick={() => {
            navigate("/privacy-policy");
          }}
          sx={{ bgcolor: "#264139", borderRadius: "10px" }}
        /> */}
      </Stack>
      <Stack direction="column" spacing={0}>
        <Typography
          color="#fff"
          fontSize="15px"
          fontWeight={200}
          onClick={() => {
            navigate("/terms-of-service");
          }}
        >
          Terms of Service
        </Typography>
        {/* <TextField
          fullWidth
          disabled
          name="privateKey"
          sx={{ bgcolor: "#264139", borderRadius: "10px" }}
        /> */}
      </Stack>
    </Stack>
  );
}

export default SecurityPrivacy;
