import {invoke} from '@tauri-apps/api/core';
import {type SignatureRequest, type SignatureResponse} from '../wallet-connect/WCTypes';

export async function sign(message: string) {
	const request: SignatureRequest = {
		message,
	};

	return invoke<SignatureResponse>('sign', {request});
}

export async function verify(message: string, signature: string, address: string) {
	return invoke<boolean>('verify', {message, address, signature});
}
