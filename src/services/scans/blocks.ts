import {invoke} from '@tauri-apps/api/core';

export async function scan_blocks(height: number, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>) {
	return invoke<boolean>('blocks_sync', {height});
}

export async function scan_public(height: number) {
	return invoke('scan_public_transitions', {end_height: height});
}

export async function handleUnconfirmedTransactions() {
	return invoke('handle_unconfirmed_transactions');
}
