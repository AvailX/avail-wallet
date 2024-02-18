import * as React from 'react';
import * as mui from '@mui/material';
import {useNavigate} from 'react-router-dom';

// Components

// services
import {session_and_local_auth} from '../services/authentication/auth';

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Types
import {type AvailError, AvailErrorType} from '../types/errors';
import Layout from './reusable/layout';

function Entrypoint() {
	const navigate = useNavigate();
	const shouldRunEffect = React.useRef(true);
	const [alert, setAlert] = React.useState<boolean>(false);
	const [alertMessage, setAlertMessage] = React.useState<string>('');

	React.useEffect(() => {
		if (shouldRunEffect.current) {
			setTimeout(() => {
				/* -- Local + Session Auth -- */
				session_and_local_auth(undefined, navigate, setAlert, setAlertMessage, true).then(res => {}).catch(error_ => {
					console.log(error_);

					const error = JSON.parse(error_) as AvailError;

					if (error.error_type === AvailErrorType.Network) {
						// TODO - Fallback of local login by just getting the view key.
					}

					if (error.error_type.toString() === 'Unauthorized') {
						navigate('/login');
					} else {
						navigate('/register');
					}
				});
			}, 3000);
			shouldRunEffect.current = false;
		}
	}, []);

	return (
		<Layout>
			<mui.Box sx={{
				display: 'flex', alignItems: 'center', alignContent: 'center', height: '100vh', justifyContent: 'center',
			}}>
				<img src={a_logo} style={{width: '12%', alignSelf: 'center'}} />
			</mui.Box>
		</Layout>
	);
}

export default Entrypoint;
