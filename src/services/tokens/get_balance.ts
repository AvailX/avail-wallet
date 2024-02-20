import {invoke} from '@tauri-apps/api/core';
import {Balance, type GetBalancesRequest, type GetBalancesResponse} from '../wallet-connect/WCTypes';

export async function get_balance(request: GetBalancesRequest) {
	const res: GetBalancesResponse = await invoke('get_balance', {request});
	return res;
}

export async function get_total_balance() {
	const res: GetBalancesResponse = await invoke('get_balance', {request: {assetId: ''}});
	return res;
}
