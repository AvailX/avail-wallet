import * as React from 'react';
import * as mui from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, {type AlertProps} from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Alert component to customize styling
const Alert = (properties: AlertProps) => <MuiAlert elevation={6} variant='filled' {...properties} />;

type ErrorAlertProperties = {
	message: string;
	errorAlert: boolean;
	setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

type WarningAlertProperties = {
	message: string;
	warningAlert: boolean;
	setWarningAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

type InfoAlertProperties = {
	message: string;
	infoAlert: boolean;
	setInfoAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

type SuccessAlertProperties = {
	message: string;
	successAlert: boolean;
	setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

// Close alerts
const handleCloseError = (setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>) => {
	setErrorAlert(false);
};

const handleCloseWarning = (setWarningAlert: React.Dispatch<React.SetStateAction<boolean>>) => {
	setWarningAlert(false);
};

const handleCloseInfo = (setInfoAlert: React.Dispatch<React.SetStateAction<boolean>>) => {
	setInfoAlert(false);
};

const handleCloseSuccess = (setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>) => {
	setSuccessAlert(false);
};

export const ErrorAlert: React.FC<ErrorAlertProperties> = ({errorAlert, message, setErrorAlert}) => (
	<Snackbar open={errorAlert} autoHideDuration={6000} onClose={() => {
		handleCloseError(setErrorAlert);
	}} anchorOrigin={{vertical: 'top', horizontal: 'center'}} >
		<div>
			<Alert severity='error' action={
				<IconButton
					size='small'
					aria-label='close'
					color='inherit'
					onClick={() => {
						handleCloseError(setErrorAlert);
					}}
				>
					<CloseIcon fontSize='small' />
				</IconButton>
			}

			>
				{message}
			</Alert>
		</div>
	</Snackbar>
);

export const WarningAlert: React.FC<WarningAlertProperties> = ({warningAlert, message, setWarningAlert}) => (
	<Snackbar open={warningAlert} autoHideDuration={6000} onClose={() => {
		handleCloseWarning(setWarningAlert);
	}} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
		<div>
			<Alert severity='warning' action={
				<IconButton
					size='small'
					aria-label='close'
					color='inherit'
					onClick={() => {
						handleCloseWarning(setWarningAlert);
					}}
				>
					<CloseIcon fontSize='small' />
				</IconButton>
			}>
				{message}
			</Alert>
		</div>
	</Snackbar>
);

export const InfoAlert: React.FC<InfoAlertProperties> = ({infoAlert, message, setInfoAlert}) => (
	<Snackbar open={infoAlert} autoHideDuration={6000} onClose={() => {
		handleCloseInfo(setInfoAlert);
	}} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
		<div>
			<Alert severity='info' action={
				<IconButton
					size='small'
					aria-label='close'
					color='inherit'
					onClick={() => {
						handleCloseInfo(setInfoAlert);
					}}
				>
					<CloseIcon fontSize='small' />
				</IconButton>
			}>
				{message}
			</Alert>
		</div>
	</Snackbar>
);

export const SuccessAlert: React.FC<SuccessAlertProperties> = ({successAlert, message, setSuccessAlert}) => (
	<Snackbar open={successAlert} autoHideDuration={6000} onClose={() => {
		handleCloseSuccess(setSuccessAlert);
	}} anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
		<div>
			<Alert severity='success' action={
				<IconButton
					size='small'
					aria-label='close'
					color='inherit'
					onClick={() => {
						handleCloseSuccess(setSuccessAlert);
					}}
				>
					<CloseIcon fontSize='small' />
				</IconButton>
			}>
				{message}
			</Alert>
		</div>
	</Snackbar>
);
