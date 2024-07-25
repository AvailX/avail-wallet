import {invoke} from '@tauri-apps/api/core';
import * as platform from 'platform';
import {type AvailError} from '../../types/errors';

export async function search(password: string | undefined, key_type: boolean) {
	if (platform.os?.family === 'Android') {
		const res: string = await invoke('android_auth', {password, key_type: key_type ? 'avl-p' : 'avl-v'});
		console.log(res);
		return res;
	}

	const res: string = await invoke('ios_auth', {password, label: key_type ? 'avl-p' : 'avl-v'});
	console.log(res);
	return res;
}

export async function delete_key(authType: boolean) {
	if (platform.os?.family === 'Android') {
		return (
			invoke<string>('keystore_delete').then(response => {
				console.log(response);
				return response;
			},
			).catch((error: AvailError) => {
				console.log('Error: ' + error.internal_msg);
				return error;
			}));
	}

	return (
		invoke<string>('delete_ios').then(response => {
			console.log(response);
			return response;
		},
		).catch((error: AvailError) => {
			console.log('Error: ' + error.internal_msg);
			return error;
		}));
}
