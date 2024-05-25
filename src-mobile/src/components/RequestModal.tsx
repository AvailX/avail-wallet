import React from "react";
import { Box, Typography } from "@mui/material";
import modallogo from "../assets/modal-logo.png";

function RequestModal() {
  var DappName = "DappName";

  return (
    <Box>
      <Box>
        <img src={modallogo} style={{ paddingTop: "150px", width: "100%" }} />
      </Box>
      <Box>
        <Typography>{DappName} wants to connect</Typography>
        <Typography>Data will be Shared if you connect</Typography>
      </Box>
      <Box>
        <p>Approve</p>
        <p>Reject</p>
      </Box>
    </Box>
  );
}

export default RequestModal;
