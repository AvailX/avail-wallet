import * as React from 'react';
import * as mui from '@mui/material';


// Types
import { type AvailError } from '../../src/types/errors';
import { Languages } from '../../src/types/languages';
import { delete_key } from '../../src/services/keychain/keychain';
import { register, checkBiometrics, register_seed_phrase } from '../../src/services/authentication/register';
import Layout from '../../src/views-desktop/reusable/layout';
import {type Length} from '../../src/components/select/seed_length';

import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

function SignUp() {
    const [username, setUsername] = React.useState<string | undefined>();
	const [password, setPassword] = React.useState('');
	const [confirmPassword, setConfirmPassword] = React.useState('');

	const [language, setLanguage] = React.useState(Languages.English);
	const [length, setLength] = React.useState<Length>({ label: '12 Words', value: 12 });

	const [passwordHidden, setPasswordHidden] = React.useState(true);
	const [confirmPasswordHidden, setConfirmPasswordHidden] = React.useState(true);

	{/* --Biometric States--*/ }
	const [biometric, setBiometric] = React.useState(false);
	const [biometricAvail, setBiometricAvail] = React.useState(false);

	{/* --Alert States--*/ }
	const [error, setError] = React.useState(false);
	const [warning, setWarning] = React.useState(false);
	const [info, setInfo] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const [message, setMessage] = React.useState('');

	const [passwordError, setPasswordError] = React.useState('');
	const [confirmPasswordError, setConfirmPasswordError] = React.useState('');

	const navigate = useNavigate();
	const { t } = useTranslation();

	function validatePassword(password: string): string {
		if (password.length < 12) {
			return t('signup.messages.errors.passwordLength');
		}

		if (!/[A-Z]/.test(password)) {
			return t('signup.messages.errors.passwordCapital');
		}

		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return t('signup.messages.errors.passwordSpecial');
		}

		return '';
	}

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newPassword = event.target.value;
		setPassword(newPassword);
		setPasswordError(validatePassword(newPassword));
	};

	const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newConfirmPassword = event.target.value;
		setConfirmPassword(newConfirmPassword);

		// You might also want to check if the passwords match here, or do it separately.
		if (newConfirmPassword === password) {
			setConfirmPasswordError(validatePassword(newConfirmPassword));
		} else {
			setConfirmPasswordError(t('signup.messages.errors.passwordMismatch'));
		}
	};

	// Check if biometrics work with mac
	const shouldRunEffect = React.useRef(true);
	function handleCreateWallet() {
		if (password != confirmPassword) {
			setMessage(t('signup.messages.errors.password1'));
			setError(true);
			return;
		}

		// If username not unique

		if (password.length < 12) {
			setMessage(t('signup.messages.errors.password2'));
			setError(true);
			return;
		}

		register_seed_phrase(setError, setMessage, username, password, biometric, language, length.value).then(response => {
			if (response) {
				// Split seed phrase into array by spaces
				const seed_array = response.split(' ');

				setMessage(t('signup.messages.success'));
				setSuccess(true);
				console.log(response);

				setTimeout(() => {
					navigate('/seed', { state: { seed: seed_array } });
				}, 800);
			}
		}).catch((error: AvailError) => {
			setMessage(error.external_msg);
			setError(true);
		});
	}


    return(
        <mui.Box>

        </mui.Box>
    )
}

export default SignUp;