import * as React from "react";
import * as mui from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../../../src/components/snackbars/alerts";
// import { delete_local_for_recovery } from "../../services/recovery/phrase";
import { delete_local_for_recovery } from "../../../../src/services/recovery/phrase";

type NewAccountDialogProperties = {
  isOpen: boolean;
  onRequestClose: () => void;
};

const NewAccountDialog: React.FC<NewAccountDialogProperties> = ({
  isOpen,
  onRequestClose,
}) => {
  // Alert states
  const [success, setSuccess] = React.useState<boolean>(false);
  const [errorAlert, setErrorAlert] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const navigate = useNavigate();

  const handleConfirmClick = () => {
    delete_local_for_recovery("")
      .then(() => {
        navigate("/username");
      })
      .catch(() => {
        setMessage(
          "An error occurred while creating a new account. Please try again."
        );
        setErrorAlert(true);
      });
  };

  const dialogStyle = {
    bgcolor: "#1E1D1D",
    color: "white",
  };

  //   const buttonStyle = {
  //     color: "#00FFAA",
  //     "&:hover": {
  //       bgcolor: "rgba(0, 255, 170, 0.1)",
  //     },
  //   };

  return (
    <>
      <ErrorAlert
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <mui.Dialog
        open={isOpen}
        onClose={onRequestClose}
        PaperProps={{ sx: dialogStyle }}
      >
        <mui.DialogTitle>New Account</mui.DialogTitle>
        <mui.DialogContent>
          <mui.DialogContentText sx={{ color: "#a3a3a3" }}>
            Are you sure you want to create a new account? This will delete the
            current account and all its data.
          </mui.DialogContentText>
        </mui.DialogContent>
        <mui.DialogActions>
          <mui.Button onClick={onRequestClose} variant='outlined'>
            {" "}
            Cancel{" "}
          </mui.Button>
          <mui.Button onClick={handleConfirmClick} variant='contained'>
            {" "}
            Confirm
          </mui.Button>
        </mui.DialogActions>
      </mui.Dialog>
    </>
  );
};

export default NewAccountDialog;
