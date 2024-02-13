import * as React from "react";
import * as mui from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';

import { transfer } from "../../services/transfer/transfers";
import { ErrorAlert, SuccessAlert } from "../snackbars/alerts";
import { useNavigate } from "react-router-dom";
import { TransferRequest } from "../../types/transfer_props/tokens";
import { AvailError } from "../../types/errors";

import { useTranslation } from "react-i18next";

interface DeleteDialogProps {
    isOpen: boolean;
    onRequestClose: () => void;
    request: TransferRequest;
}

// This is used in case of auth session timeout
const TransferDialog: React.FC<DeleteDialogProps> = ({ isOpen, onRequestClose,request }) => {
    const [password, setPassword] = React.useState("");
   
    // alert states
    const [success, setSuccess] = React.useState<boolean>(false);
    const [errorAlert, setErrorAlert] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleConfirmClick = () => {
        if (request.asset_id ===  "ALEO"){
            request.asset_id= "credits";
        }
      //set the password in the request
        request.password = password;
        onRequestClose();

       transfer(request, setErrorAlert,setMessage).catch((e) => {
        console.log(e);
        const error = JSON.parse(e) as AvailError;

        console.log("Error" + error);
        setMessage("Failed to transfer, please try again.");
        setErrorAlert(true);
     });
    }

    const dialogStyle = {
        bgcolor: '#363636',
        color: 'white',
        borderRadius: '20px',
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
            <mui.DialogTitle>{t("dialogs.transfer.title")}</mui.DialogTitle>
            <mui.DialogContent>
                <mui.DialogContentText sx={{color:'#B2B2B2'}}>
                    {/* Enable translation here */}
                   By confirming the transaction, you will be sending {request.amount/1000000} {request.asset_id} to {request.recipient}.
                </mui.DialogContentText>
                <mui.TextField
                    autoFocus
                    margin="dense"
                    type="password"
                    label="Password"
                    fullWidth
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    sx={{mt:'8%', ...textFieldStyle}}
                />
            </mui.DialogContent>
            <mui.DialogActions>
                <mui.Button onClick={onRequestClose} sx={buttonStyle}>{t("dialogs.options.cancel")}</mui.Button>
                <mui.Button onClick={handleConfirmClick} sx={buttonStyle}>{t("dialogs.options.confirm")}</mui.Button>
            </mui.DialogActions>
        </mui.Dialog>
        </>
    );
}

export default TransferDialog;