import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';
import { Update } from '@tauri-apps/plugin-updater';
import { relaunch } from "@tauri-apps/plugin-process";

type UpdateDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
    update: Update | null;
};

const UpdateDialog: React.FC<UpdateDialogProperties> = ({isOpen, onRequestClose,update}) => {
	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const {t} = useTranslation();

    const formatDateStr = (date: string | undefined) => {
        if (!date) return '';
        // the date looks like 2024-02-21 15:39:48.592 +00:00:00
        // so just separate from the first whitespace and return the first part

        const dateStr = date.split(' ')[0];
        return dateStr;
    }

	const handleConfirmClick = () => {
        if(update){
        update.downloadAndInstall().then(()=>{
            setMessage('The app will now restart to apply the update');
            setSuccess(true);

            setTimeout(async() => {
            await relaunch();
            }, 2000);

        }).catch((e)=>{
            setMessage(e);
            setErrorAlert(true);
        })}else{
            setMessage('No update available');
            setErrorAlert(true);
        }
	};

	const dialogStyle = {
		bgcolor: '#1E1D1D',
		color: 'white',
	};

	const textFieldStyle = {
		input: {color: 'white'},
		label: {color: 'gray'},
		'& label.Mui-focused': {color: '#00FFAA'},
		'& .MuiInput-underline:after': {borderBottomColor: '#00FFAA'},
		'& .MuiOutlinedInput-root': {
			'& fieldset': {borderColor: 'gray'},
			'&:hover fieldset': {borderColor: 'white'},
			'&.Mui-focused fieldset': {borderColor: '#00FFAA'},
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
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{sx: dialogStyle}}>
				<mui.DialogTitle>Do you want to update to v{update?.version} released on {formatDateStr(update?.date)}?</mui.DialogTitle>
				<mui.DialogContent>
					<mui.DialogContentText sx={{color: '#a3a3a3'}}>
						{update?.body}
					</mui.DialogContentText>
				</mui.DialogContent>
				<mui.DialogActions>
					<mui.Button onClick={onRequestClose} sx={buttonStyle}> {t('dialogs.options.cancel')}</mui.Button>
					<mui.Button onClick={handleConfirmClick} sx={buttonStyle}> {t('dialogs.options.confirm')}</mui.Button>
				</mui.DialogActions>
			</mui.Dialog>
		</>
	);
};

export default UpdateDialog;
