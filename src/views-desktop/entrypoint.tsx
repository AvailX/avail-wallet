import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {os} from '../services/util/open';

// Components
import UpdateDialog from '../components/dialogs/update';
import UpdateAlert from '../components/dialogs/update_alert';

// Services
import {session_and_local_auth} from '../services/authentication/auth';
import {relaunch} from '@tauri-apps/plugin-process';

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Types
import {type AvailError, AvailErrorType} from '../types/errors';
import {type Update} from '@tauri-apps/plugin-updater';
import Layout from './reusable/layout';

import {ErrorAlert} from '../components/snackbars/alerts';
import update from '../services/util/updater';
import {useWalletConnectManager} from '../context/WalletConnect';
import {listen} from '@tauri-apps/api/event';

function Entrypoint() {
	const navigate = useNavigate();
	const shouldRunEffect = React.useRef(true);
	const [alert, setAlert] = React.useState<boolean>(false);
	const [alertMessage, setAlertMessage] = React.useState<string>('');
	const {walletConnectManager} = useWalletConnectManager();
	const [updateDialog, setUpdateDialog] = React.useState<boolean>(false);

	const initDeepLink = async () => {
		await listen('deep-link-wc', async event => {
			const {uri} = event.payload as {uri: string}; // Add type assertion

			// Decode the uri
			const wcUri = uri.split('\"')[1].split('avail://wc?uri=')[1];
			console.log('Deep link uri:', wcUri);
			const decodedUri = decodeURIComponent(wcUri);
			console.log('Decoded uri:', decodedUri);

			// If (decodedUri)
			await walletConnectManager.pair(decodedUri);
		});
	};

	React.useEffect(() => {
		if (shouldRunEffect.current) {
			update().then(async update_res => {
				if (update_res?.available) {
					setUpdateDialog(true);
					update_res.downloadAndInstall().then(() => {
					// Set alert with message that "There is an update in progess. Please wait app will restart." and a loading spinner
						setTimeout(async () => {
							//await relaunch();
						}, 2000);
					}).catch(() => {
						setUpdateDialog(false);
						setAlertMessage('Failed to download and install the update.');
						setAlert(true);
					});
				} else {
					await initDeepLink();
					setTimeout(() => {
						/* -- Local + Session Auth -- */
						session_and_local_auth(undefined, navigate, setAlert, setAlertMessage, true).catch(async error_ => {
							console.log(error_);

							let error = error_;
							const osType = await os();
							if (osType !== 'linux') {
								error = JSON.parse(error_) as AvailError;
							}

							if (error.error_type === AvailErrorType.Network) {
								// TODO - Desktop login
							}

							if (error.error_type.toString() === 'Unauthorized') {
								navigate('/login');
							} else {
								navigate('/register');
							}
						});
					}, 3000);
				}
			}).catch(() => {
				setAlertMessage('Failed to fetch latest update.');
				setAlert(true);
			});

			shouldRunEffect.current = false;
		}
	}, []);

	return (
		<Layout>
			<UpdateAlert open={updateDialog}/>
			<ErrorAlert errorAlert={alert} setErrorAlert={setAlert} message={alertMessage} />
			<mui.Box sx={{
				display: 'flex', alignItems: 'center', alignContent: 'center', height: '100vh', justifyContent: 'center',
			}}>
				<img src={a_logo} style={{width: '12%', alignSelf: 'center'}} />
			</mui.Box>
		</Layout>
	);
}

export default Entrypoint;
