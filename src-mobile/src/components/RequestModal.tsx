import React from "react";
import { Box, Button, Typography } from "@mui/material";
import modallogo from "../assets/modal-logo.png";
import splashImg from "../assets/green-splash.svg";

function RequestModal() {
  var DappName = "DappName";

  return (
    <Box display="flex" flexDirection="column" margin="0">
      <Box
        mx="auto"
        display="flex"
        alignItems="center"
        justifyContent="center"
        my={2}
      >
        <img
          src={modallogo}
          style={{
            paddingTop: "5px",
            width: "86px",
            height: "110px",
          }}
        />
      </Box>
      <Box justifyItems="center">
        <Typography
          fontSize="24px"
          mr={1}
          fontWeight={500}
          sx={{ color: "#fff" }}
        >
          {DappName} wants to connect
        </Typography>
        <Typography
          fontSize="20px"
          textAlign="center"
          // lineHeight="10px"
          mr={1}
          fontWeight={400}
          sx={{ color: "#767474" }}
        >
          What Data will be Shared if you connect*
        </Typography>
      </Box>
      <Box
        mx="auto"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        mt={2}
      >
        <Button
          sx={{
            background: "#225746",
            color: "#00FFAA",
            border: 0,
            py: 0.5,
            px: 2,
            m: 0,
            fontSize: 22,
          }}
          type="submit"
          aria-label="approve"
        >
          Approve
        </Button>
        <Button
          sx={{
            background: "#225746",
            color: "#00FFAA",
            border: 0,
            py: 0.5,
            px: 2,
            m: 0,
            fontSize: 22,
          }}
          type="submit"
          aria-label="approve"
        >
          Reject
        </Button>
      </Box>
    </Box>
  );
}

export default RequestModal;
