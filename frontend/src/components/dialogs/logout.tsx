import * as React from "react";
import * as mui from "@mui/material";

import { ErrorAlert, SuccessAlert } from "../snackbars/alerts";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

interface LogoutDialogProps {
    isOpen: boolean;
    onRequestClose: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ isOpen, onRequestClose }) => {
   
    // alert states
    const [success, setSuccess] = React.useState<boolean>(false);
    const [errorAlert, setErrorAlert] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleConfirmClick = () => {
       navigate("/login");
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
            <mui.DialogTitle>{t("dialogs.logout.title")}</mui.DialogTitle>
            <mui.DialogContent>
                <mui.DialogContentText sx={{color:'#a3a3a3'}}>
                {t("dialogs.logout.description")}
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

export default LogoutDialog;