import {invoke} from '@tauri-apps/api/core';
import * as platform from 'platform';
import {type NavigateFunction} from 'react-router-dom';
import {type AvailError} from '../../types/errors';
import {type Languages} from '../../types/languages';
import {get_os_function_name} from '../util/functions';

export function register(setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>, setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, username: string | undefined, password: string, authType: boolean, language: Languages, navigate: NavigateFunction) {
	const function_to_call = 'create_wallet';

	invoke<string>(get_os_function_name(function_to_call), {
		username, password, access_type: authType, backup: false, language,
	})
		.then(response => {
			if (response === 'Key stored') {
				setMessage('Wallet created successfully.');
				setSuccessAlert(true);
				navigate('/home', {state: {username}});
			} else {
				setMessage('Problem when creating account, apologies. Please try again.');
				setErrorAlert(true);
			}
		})
		.catch((error: AvailError) => {
			// TODO - Sentry should log AvailError
			setMessage('Problem when creating account, apologies. Please try again.');
			setErrorAlert(true);
		});
}

// TODO - add backup parameter
export async function register_seed_phrase(setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, username: string | undefined, password: string, authType: boolean, language: Languages, length: number) {
	console.log('Registering seed phrase wallet');

	return (invoke<string>('create_seed_phrase_wallet', {
		username, password, access_type: authType, backup: false, language, length,
	}).then(response => response).catch((error: AvailError) => {
		// TODO - Sentry should log AvailError
		setMessage('Problem when creating account, apologies. Please try again.');
		setErrorAlert(true);
		console.log(error);
	}));
}

export async function import_wallet(username: string, password: string, authType: boolean, private_key: string, language: Languages) {
	const response: string = await invoke<string>('import_wallet', {
		username, password, access_type: authType, private_key, backup: false, language,
	});
	return response;
}

// For Mobile
export async function checkBiometrics() {
	if (platform.os?.family === 'Android') {
		const permission: boolean = await invoke('device_auth_permission');

		if (permission) {
			const fingerprint: boolean = await invoke('device_auth_availability');
			return fingerprint;
		}

		return false;
	}

	const response: boolean = await invoke('prepare_context');
	console.log(response);
	return response;
}
