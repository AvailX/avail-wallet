import * as React from "react";
import * as mui from "@mui/material";


import { ErrorAlert, SuccessAlert } from "../snackbars/alerts";
import { useNavigate } from "react-router-dom";
import { updateUsername } from "../../services/storage/persistent";

import { useTranslation } from "react-i18next";

interface UsernameDialogProps {
    isOpen: boolean;
    onRequestClose: () => void;
    username: string;
    originalUsername: string;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({ isOpen, onRequestClose,username,originalUsername }) => {
   
    // alert states
    const [success, setSuccess] = React.useState<boolean>(false);
    const [errorAlert, setErrorAlert] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const { t } = useTranslation();

    const handleConfirmClick = () => {
        updateUsername(username).then(() => {
            setMessage('Username updated');
            setSuccess(true);
          }).catch((e) => {
            setMessage('Error updating username');
            setErrorAlert(true);
          });
    }

    const dialogStyle = {
        bgcolor: '#1E1D1D',
        color: 'white',
    };

    const textFieldStyle = {
        input: { color: 'white' },
        label: { color: 'gray' },
        '& label.Mui-focused': { color: '#00FFAA' },
        '& .MuiInput-underline:after': { borderBottomColor: '#00FFAA' },
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'gray' },
            '&:hover fieldset': { borderColor: 'white' },
            '&.Mui-focused fieldset': { borderColor: '#00FFAA' },
        },
    };

    const buttonStyle = {
        color: '#00FFAA',
        '&:hover': {
            bgcolor: 'rgba(0, 255, 170, 0.1)',
        },
    };

    return (
        <>
        <ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message}/>
        <SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
        <mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{ sx: dialogStyle }}>
            <mui.DialogTitle>Would you like to update your username?</mui.DialogTitle>
            <mui.DialogContent>
                <mui.DialogContentText sx={{color:'#a3a3a3'}}>
                By clicking confirm, your username will be updated from {originalUsername} to {username}.
                </mui.DialogContentText>
            </mui.DialogContent>
            <mui.DialogActions>
                <mui.Button onClick={onRequestClose} sx={buttonStyle}> {t("dialogs.options.cancel")}</mui.Button>
                <mui.Button onClick={handleConfirmClick} sx={buttonStyle}> {t("dialogs.options.confirm")}</mui.Button>
            </mui.DialogActions>
        </mui.Dialog>
        </>
    );
}

export default UsernameDialog;