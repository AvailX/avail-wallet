import React from 'react';
import {
	Dialog, DialogContent, DialogContentText, CircularProgress,
} from '@mui/material';

type UpdateAlertProps = {
	open: boolean;
};

const UpdateAlert: React.FC<UpdateAlertProps> = ({open}) => (
	<Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' PaperProps={{sx:{bgcolor:'#1F1D1D'}}}>
		<DialogContent style={{textAlign: 'center'}}>
			<CircularProgress style={{margin: '20px 0'}} />
			<DialogContentText id='alert-dialog-description' style={{marginTop: 20, fontSize:'1.2rem'}}>
          Update in progress... Please wait, the app will restart.
			</DialogContentText>
		</DialogContent>
	</Dialog>
);

export default UpdateAlert;
