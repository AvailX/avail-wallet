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
  const dialogStyle = {
    bgcolor: "#1E1D1D",
    color: "white",
  };

  const buttonStyle = {
    color: "#00FFAA",
    "&:hover": {
      bgcolor: "rgba(0, 255, 170, 0.1)",
    },
  };

  return (
    <mui.Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog"
      PaperProps={{ sx: dialogStyle }}
    >
      <mui.DialogTitle id="confirm-dialog">{title}</mui.DialogTitle>
      <mui.DialogContent>
        <mui.DialogContentText sx={{ color: "#a3a3a3" }}>
          {content}
        </mui.DialogContentText>
      </mui.DialogContent>
      <mui.DialogActions>
        <mui.Button onClick={onClose} color="primary" sx={buttonStyle}>
          Cancel
        </mui.Button>
        <mui.Button onClick={onConfirm} color="primary" sx={buttonStyle}>
          Confirm
        </mui.Button>
      </mui.DialogActions>
    </mui.Dialog>
  );
};

export default ConfirmDialog;

/* 


			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{sx: dialogStyle}}>
				<mui.DialogTitle>{t('dialogs.logout.title')}</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{color: '#a3a3a3'}}>
						{t('dialogs.logout.description')}
					</mui.DialogContentText>
				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> {t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}> {t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>

*/
