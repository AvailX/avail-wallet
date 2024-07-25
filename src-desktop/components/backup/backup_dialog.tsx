import * as React from 'react';
import {
	Box, Drawer, IconButton, Typography, Avatar, Divider,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';

// Icons
import CloseIcon from '@mui/icons-material/Close';

// Typography
import {useTranslation} from 'react-i18next';
import {
	SmallText, SubMainTitleText, Title2Text, SubtitleText, TitleText, BodyText500, BodyText,
} from '../typography/typography';
import CTAButton from '../buttons/cta';
import STButton from '../buttons/settings-button';

// Services
import {updateBackupFlag} from '../../services/storage/persistent';

// Images
import backup from '../../assets/images/backup.svg';

// Alerts
import {
	ErrorAlert, WarningAlert, InfoAlert, SuccessAlert,
} from '../snackbars/alerts';

export type BackupDrawerProps = {
	open: boolean;
	onClose: () => void;
};

const BackupDialog: React.FC<BackupDrawerProps> = ({open, onClose}) => {
	// Alerts
	const [error, setError] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const {t} = useTranslation();

	const handleBackupChoise = (response: boolean) => {
		updateBackupFlag(response).then(() => {
			if (response) {
				setMessage(t('backup.messages.enabled'));
			} else {
				setMessage(t('backup.messages.disabled'));
			}

			setSuccess(true);
			onClose();
		}).catch(error => {
			console.log(error);
			setMessage(t('backup.messages.error'));
			setError(true);
		});
	};

	return (
		<Drawer
			anchor='bottom'
			open={open}
			sx={{
				'& .MuiDrawer-paper': {
					borderTopLeftRadius: '20px',
					borderTopRightRadius: '20px',
					height: '90%', // Drawer height
					overflow: 'hidden', // Prevent scrolling on the entire drawer
					bgcolor: '#1E1D1D',
					width: '85%',
					alignSelf: 'center',
					justifyContent: 'center',
					display: 'flex',
					flexDirection: 'column',
					ml: '7.5%',
				},
				alignSelf: 'center',
			}}
		>
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
			<ErrorAlert errorAlert={error} setErrorAlert={setError} message={message}/>
			<Box sx={{
				width: '85%', display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'center',
			}}>
				<SubMainTitleText sx={{color: '#FFF'}}>{t('backup.title.part1')}</SubMainTitleText>
				<SubMainTitleText sx={{color: '#00FFAA', ml: '1%'}}>{t('backup.title.part2')}</SubMainTitleText>
				<SubMainTitleText sx={{color: '#FFF', ml: '1%'}}>?</SubMainTitleText>
			</Box>

			<Box sx={{
				width: '100%', display: 'flex', flexDirection: 'row', mt: '3%', justifyContent: 'center',
			}}>
				<BodyText500 sx={{color: '#FFF'}}>{t('backup.subtitle.part1')}</BodyText500>
				<BodyText500 sx={{color: '#a2a2a2', ml: '1%'}}>{t('backup.subtitle.part2')} </BodyText500>
			</Box>

			<img src={backup} style={{
				width: '60%', height: 'auto', marginTop: '5%', alignSelf: 'center',
			}}/>

			<BodyText sx={{
				width: '80%', alignSelf: 'center', textAlign: 'center', color: '#fff', mt: '2%',
			}}>
				{t('backup.description')}
			</BodyText>

			<Box sx={{
				display: 'flex', flexDirection: 'row', alignSelf: 'center', width: '55%', justifyContent: 'space-between', mt: '5%',
			}}>
				<CTAButton onClick={() => {
					handleBackupChoise(false);
				}} text={t('backup.nobackup')} width='35%'/>
				<CTAButton onClick={() => {
					handleBackupChoise(true);
				}} text={t('backup.backup')} width='35%'/>
			</Box>
		</Drawer>
	);
};

export default BackupDialog;
