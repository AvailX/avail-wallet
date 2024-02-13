import * as React from "react";
import * as mui from "@mui/material";

import { getSeedPhrase } from "../../../services/storage/keys";
import { ErrorAlert, SuccessAlert } from "../../snackbars/alerts";

interface SPDialogProps {
    isOpen: boolean;
    onRequestClose: () => void;
    setSeedPhrase: (key: string) => void;
}

const SeedPhraseDialog: React.FC<SPDialogProps> = ({ isOpen, onRequestClose,setSeedPhrase }) => {
    const [password, setPassword] = React.useState("");
   
    // alert states
    const [success, setSuccess] = React.useState<boolean>(false);
    const [errorAlert, setErrorAlert] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const handleConfirmClick = () => {
        getSeedPhrase(password).then((res)=>{
            setSeedPhrase(res);
            onRequestClose();
       }).catch((err)=>{
                console.log(err);
                setMessage("Error getting Seed Phrase. Please try again.");
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
            <mui.DialogTitle>Do you want to get your Secret Phrase ?</mui.DialogTitle>
            <mui.DialogContent>
                <mui.DialogContentText sx={{color:'#a3a3a3'}}>
                    This action will decrypt your Secret Phrase and display it on the screen. Enter your password to continue.
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
                <mui.Button onClick={onRequestClose} sx={buttonStyle}>Cancel</mui.Button>
                <mui.Button onClick={handleConfirmClick} sx={buttonStyle}>Confirm</mui.Button>
            </mui.DialogActions>
        </mui.Dialog>
        </>
    );
}

export default SeedPhraseDialog;