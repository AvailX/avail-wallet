import {invoke} from '@tauri-apps/api/core';
import {type Languages} from '../../types/languages';

export async function getAuthType() {
	const res: string = await invoke('get_auth_type');

	return res;
}

export async function getUsername() {
	const res: string = await invoke('get_username');

	return res;
}

export async function get_address() {
	const response: string = await invoke('get_address_string');
	return response;
}

export async function getAndStoreEncryptedData() {
	const res: string = await invoke('get_and_store_all_data');
	return res;
}

export async function getLastSync() {
	const res: number = await invoke('get_last_sync');
	return res;
}

export async function RemoveViewSession() {
	const res: string = await invoke('remove_view_session');
	return res;
}

export async function updateUsername(username: string) {
	const res: string = await invoke('update_username', {username});
	return res;
}

export async function getBackupFlag() {
	const res: boolean = await invoke('get_backup_flag');
	return res;
}

export async function updateBackupFlag(backup_flag: boolean) {
	const res: string = await invoke('update_backup_flag', {backup_flag});
	return res;
}

export async function getNetwork() {
	const res: string = await invoke('get_network');
	return res;
}

export async function updateNetwork(network: string) {
	const res: string = await invoke('update_network', {network});
	return res;
}

export async function getLanguage() {
	const res: Languages = await invoke('get_language');
	return res;
}

export async function updateLanguage(language: Languages) {
	const res: string = await invoke('update_language', {language});
	return res;
}
