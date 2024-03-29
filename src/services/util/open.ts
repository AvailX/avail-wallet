import {invoke} from '@tauri-apps/api/core';

export async function open_url(url: string) {
	return invoke('open_url', {url});
}

export async function os() {
	return invoke<string>('os_type');
}
