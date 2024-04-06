import {invoke} from '@tauri-apps/api/core';

export enum NetworkStatus {
	Up = 'Up',
	Down = 'Down',
	Warning = 'Warning',
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
	return invoke<NetworkStatus>('network_status_check');
}
