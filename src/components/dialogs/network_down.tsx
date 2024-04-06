import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ErrorAlert, SuccessAlert} from '../snackbars/alerts';
import Close from '@mui/icons-material/Close';
import {open_url} from '../../services/util/open';

import networkDown from '../../assets/images/backgrounds/networkDown.png';
import avlDiscord from '../../assets/icons/avlDiscord.svg';
// Typography
import {Title2Text, BodyText500} from '../typography/typography';
import {NetworkStatus} from '../../services/util/network';

type NetworkDownDialogProperties = {
	isOpen: boolean;
	onRequestClose: () => void;
	status: NetworkStatus;
};

const NetworkDownDialog: React.FC<NetworkDownDialogProperties> = ({isOpen, onRequestClose,status}) => {
	// Alert states
	const [success, setSuccess] = React.useState<boolean>(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const navigate = useNavigate();
	const {t} = useTranslation();

	const sm = mui.useMediaQuery('(min-width:850px)');
	const md = mui.useMediaQuery('(min-width:1100px)');

	const dialogStyle = {
		bgcolor: '#1E1D1D',
		color: 'white',
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		height: '270px',
		borderRadius: '10px',
	};

	const buttonStyle = {
		color: '#00FFAA',
		'&:hover': {
			bgcolor: 'rgba(0, 255, 170, 0.1)',
		},
	};

	return (
		<>
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message} />
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message} />
			<mui.Dialog open={isOpen} onClose={onRequestClose} PaperProps={{sx: dialogStyle}}>
				<mui.Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
					<Close sx={{color: '#a3a3a3', width: '30px', height: '30px', cursor: 'pointer'}} onClick={() => {onRequestClose();}}/>
					{status === NetworkStatus.Down ? (
						<>
							<Title2Text sx={{lineHeight: 0.9, mt: '5%', pl: '2%'}}>Network temporarily <Title2Text sx={{color: '#FF0000', lineHeight: 0.9}}>down</Title2Text></Title2Text>
							<mui.Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '5%', pl: '2%'}}>
								<BodyText500>Whilst they build, come conversate with us on
									<BodyText500 sx={{color: '#00FFAA', cursor: 'pointer', alignItems: 'center', display: 'flex'}}
										onClick={async () => {
											await open_url('https://discord.gg/avail-1140618884764942386');
										}}> discord.
										<img src={avlDiscord} alt='avail-discord' style={{cursor: 'pointer', width: '30px', height: '30px', marginLeft: '4px'}}
											onClick={async () => {
												await open_url('https://discord.gg/avail-1140618884764942386');
											}}/>
									</BodyText500>
								</BodyText500>
							</mui.Box>
						</>)
						: (
							<>
								<Title2Text sx={{lineHeight: 0.9, mt: '5%', pl: '2%'}}>Network may cause <Title2Text sx={{color: '#FFA500', lineHeight: 0.9}}>issues</Title2Text></Title2Text>
								<mui.Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '5%', pl: '2%'}}>
									<BodyText500> If it does please contact us on
										<BodyText500 sx={{color: '#00FFAA', cursor: 'pointer', alignItems: 'center', display: 'flex'}}
											onClick={async () => {
												await open_url('https://discord.gg/avail-1140618884764942386');
											}}> discord.
											<img src={avlDiscord} alt='avail-discord' style={{cursor: 'pointer', width: '30px', height: '30px', marginLeft: '4px'}}
												onClick={async () => {
													await open_url('https://discord.gg/avail-1140618884764942386');
												}}/>
										</BodyText500>

									</BodyText500>
								</mui.Box>
							</>
						)
					}
				</mui.Box>
			</mui.Dialog>
		</>
	);
};

export default NetworkDownDialog;
