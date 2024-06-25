import * as React from "react";
import * as mui from "@mui/material";

interface ConfirmDialogProps {
  open: boolean; // Flag to control dialog visibility
  onClose: () => void; // Function to handle closing the dialog
  onConfirm: () => void; // Function to handle confirmation action
  title: string; // Title for the dialog
  content: string; // Content to display in the dialog body
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
}) => {
  return (
    <mui.Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog">
      <mui.DialogTitle id="confirm-dialog">{title}</mui.DialogTitle>
      <mui.DialogContent>
        <mui.DialogContentText>{content}</mui.DialogContentText>
      </mui.DialogContent>
      <mui.DialogActions>
        <mui.Button onClick={onClose} color="primary">
          Cancel
        </mui.Button>
        <mui.Button onClick={onConfirm} color="primary">
          Confirm
        </mui.Button>
      </mui.DialogActions>
    </mui.Dialog>
  );
};

export default ConfirmDialog;
