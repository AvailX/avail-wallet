import React from "react";
import { Box, Button, Typography } from "@mui/material";
import EastIcon from "@mui/icons-material/East";

function TestnetFaucet() {
  return (
    <Box px={2} position="relative" bgcolor="#111111" color="#fff">
      <Button
        fullWidth
        sx={{
          background:
            "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
          py: 2,
        }}
        variant="contained"
        type="submit"
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <span style={{ color: "blue" }}>Testnet Token Faucet</span>
            <Typography
              textAlign="center"
              mt={3}
              fontSize="10px"
              lineHeight="12.88px"
              sx={{ color: "#fff" }}
            >
              Claim Token on Aloe Testnet
            </Typography>
          </Box>
          <EastIcon sx={{ color: "#fff" }} />
        </Box>
      </Button>
    </Box>
  );
}

export default TestnetFaucet;
