import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { JsonRpcResult, JsonRpcError } from "@walletconnect/jsonrpc-utils";
import { type WalletConnectRequest } from "./WCTypes";

interface WalletConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: () => Promise<JsonRpcResult | JsonRpcError>;
  onReject: () => Promise<JsonRpcResult | JsonRpcError>;
  wcRequest: WalletConnectRequest;
}

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onClose,
  onApprove,
  onReject,
  wcRequest,
}) => {
  const handleApprove = async () => {
    const response = await onApprove();
    onClose();
    return response;
  };

  const handleReject = async () => {
    const response = await onReject();
    onClose();
    return response;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={
          {
            /* Your styling here */
          }
        }
      >
        <Typography variant="h6">{wcRequest.question}</Typography>
        {/* You can add more details about the request here */}
        <Button onClick={handleApprove} color="primary">
          Approve
        </Button>
        <Button onClick={handleReject} color="secondary">
          Reject
        </Button>
      </Box>
    </Modal>
  );
};

export default WalletConnectDialog;
