import * as React from 'react';
import * as mui from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { os } from '../services/util/open';

// Components
import UpdateDialog from '../components/dialogs/update';

// services
import { session_and_local_auth } from '../services/authentication/auth';

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Types
import { type AvailError, AvailErrorType } from '../types/errors';
import { Update } from '@tauri-apps/plugin-updater';
import Layout from './reusable/layout';

import { ErrorAlert } from '../components/snackbars/alerts';
import update from '../services/util/updater';
import { useWalletConnectManager } from '../context/WalletConnect';
import { listen } from '@tauri-apps/api/event';


function Entrypoint() {
	const navigate = useNavigate();
	const shouldRunEffect = React.useRef(true);
	const [alert, setAlert] = React.useState<boolean>(false);
	const [alertMessage, setAlertMessage] = React.useState<string>('');
	const {walletConnectManager} = useWalletConnectManager();
	const [updateObject, setUpdateObject] = React.useState<Update | null>(null);
	const [updateDialog, setUpdateDialog] = React.useState<boolean>(false);

	const handleClose = () => {
		setUpdateDialog(false);
		setTimeout(() => {
			/* -- Local + Session Auth -- */
			session_and_local_auth(undefined, navigate, setAlert, setAlertMessage, true).then(res => { }).catch(async error_ => {
				console.log(error_);

				let error = error_;
				const os_type = await os();
				if (os_type !== 'linux') {
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
	const initDeepLink = async () => {

		listen('deep-link-wc', async (event) => {
			const { uri } = event.payload as { uri: string }; // Add type assertion
			console.log('Deep link uri:', uri.split('\"')[1].split('avail://wc?uri=')[1]);
			// decode the uri
			let wcUri = uri.split('\"')[1].split('avail://wc?uri=')[1];
			let decodedUri = decodeURIComponent(wcUri);
			console.log('Decoded uri:', decodedUri);
			// if (decodedUri)
			await walletConnectManager.pair(decodedUri);
		});

	};

	React.useEffect(() => {

		if (shouldRunEffect.current) {
			update().then(async (update_res) => {
				setUpdateObject(update_res);
				console.log("Restart the app!")
				if (update_res?.available) {
					setUpdateDialog(true);
				} else {
					await initDeepLink();
					setTimeout(() => {
						/* -- Local + Session Auth -- */
						session_and_local_auth(undefined, navigate, setAlert, setAlertMessage, true).then(res => { }).catch(async error_ => {
							console.log(error_);

							let error = error_;
							const os_type = await os();
							if (os_type !== 'linux') {
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

			}).catch(async() => {

				{/* --TESTING ANDROID START-- */}
				await initDeepLink();
				setTimeout(() => {
					/* -- Local + Session Auth -- */
					session_and_local_auth(undefined, navigate, setAlert, setAlertMessage, true).then(res => { }).catch(async error_ => {
						console.log(error_);

						let error = error_;
						const os_type = await os();
						if (os_type !== 'linux' && os_type !== 'android' && os_type !== 'ios') {
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

				{/* --TESTING ANDROID START-- */}

				setAlertMessage("Failed to fetch latest update.");
				setAlert(true);
			});

			shouldRunEffect.current = false;
		}
	}, []);

	return (
		<Layout>
			<ErrorAlert errorAlert={alert} setErrorAlert={setAlert} message={alertMessage} />
			<UpdateDialog isOpen={updateDialog} onRequestClose={() => handleClose()} update={updateObject} />
			<mui.Box sx={{
				display: 'flex', alignItems: 'center', alignContent: 'center', height: '100vh', justifyContent: 'center',
			}}>
				<img src={a_logo} style={{ width: '12%', alignSelf: 'center' }} />
			</mui.Box>
		</Layout>
	);
}

export default Entrypoint;
