import * as React from 'react';
import * as mui from '@mui/material';
import {useTranslation} from 'react-i18next';

// Alerts
import QRCode from 'react-qr-code';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';

// Qr-code

type ReceiveProperties = {
	open: boolean;
	handleClose: () => void;
	address: string;
	username: string;
};

const dialogStyle = {
	bgcolor: '#1E1D1D',
	color: 'white',
	borderRadius: '20px',
	display: 'flex',
	flexDirection: 'column',
};

const buttonStyle = {
	color: '#00FFAA',
	'&:hover': {
		bgcolor: 'rgba(0, 255, 170, 0.1)',
	},
};

const Receive: React.FC<ReceiveProperties> = ({open, handleClose, address, username}) => {
	const {t} = useTranslation();

	return (
		<mui.Dialog open={open} onClose={handleClose} PaperProps={{sx: dialogStyle}}>
			<mui.DialogTitle>{t('dialogs.receive.title')}</mui.DialogTitle>
			<mui.DialogContent sx={{display: 'flex', flexDirection: 'column'}}>
				<mui.DialogContentText sx={{color: '#b2b2b2'}}>
					{t('dialogs.receive.subtitle')}
				</mui.DialogContentText>
				{ username !== address
                && <>
                	<mui.DialogContentText sx={{color: '#b2b2b2', mt: '5%'}}>
                		{t('dialogs.receive.username')}
                	</mui.DialogContentText>
                	<mui.DialogContentText sx={{color: '#FFF', mt: '1%'}}>
                		{username}
                	</mui.DialogContentText>
                </>
				}
				<mui.DialogContentText sx={{color: '#b2b2b2', mt: '3%'}}>
					{t('dialogs.receive.address')}
				</mui.DialogContentText>
				<mui.DialogContentText sx={{color: '#FFF', mt: '1%'}}>
					{address}
				</mui.DialogContentText>
				<mui.Box sx={{
					bgcolor: '#fff', p: '10px', alignSelf: 'center', width: '47%', mt: '5%',
				}}>
					<QRCode value={address} />
				</mui.Box>
				<mui.DialogContentText sx={{color: '#00FFAA', alignSelf: 'center'}}>
					{t('dialogs.receive.qr-description')}
				</mui.DialogContentText>
			</mui.DialogContent>
			<mui.DialogActions>
				<mui.Button onClick={handleClose} sx={buttonStyle}> {t('dialogs.receive.okay')}</mui.Button>
			</mui.DialogActions>
		</mui.Dialog>
	);
};

export default Receive;
