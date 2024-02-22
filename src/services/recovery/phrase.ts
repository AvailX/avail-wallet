import {invoke} from '@tauri-apps/api/core';
import {type NavigateFunction} from 'react-router-dom';
import {type AvailError} from '../../types/errors';
import {type Languages} from '../../types/languages';

import { os } from '../util/open';

export async function recover(phrase: string, password: string, authType: boolean, language: Languages, navigate: NavigateFunction, setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>, setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>) {
	return delete_local_for_recovery(password).then(() => {
		invoke<string>('recover_wallet_from_seed_phrase', {
			seed_phrase: phrase, password, access_type: authType, language,
		}).then(response => {
			setMessage('Wallet recovered successfully.');
			setSuccessAlert(true);

			setTimeout(() => {
				navigate('/home');
			}, 800);
		}).catch(async(error_) => {
			let error = error_;
			const os_type = await os();

			if (os_type !== 'linux') {
				error = JSON.parse(error_) as AvailError;
			}

			console.log('Error: ' + error.internal_msg);

			setMessage("Recovery Failed: "+error.external_msg);
			setErrorAlert(true);
		});
	}).catch(async(error_) => {
		let error = error_;
		const os_type = await os();

		if (os_type !== 'linux') {
			error = JSON.parse(error_) as AvailError;
		}

		setMessage(error.external_msg);
		setErrorAlert(true);
	});
}

export async function delete_local_for_recovery(password: string) {
	return invoke('delete_local_for_recovery', {password});
}
