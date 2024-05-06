import {invoke} from '@tauri-apps/api/core';

export enum NetworkStatus {
	Up = 'Up',
	Down = 'Down',
	Warning = 'Warning',
}

// Checks the network status and notifies the user with a warning if network is stuck or down.
export async function getNetworkStatus(): Promise<NetworkStatus> {
	return invoke<NetworkStatus>('network_status_check');
}

// Switches to Obscura as intermediary handler for aleo public client performing poorly.
export async function switchToObscura(): Promise<void> {
	return invoke('switch_to_obscura');
}
