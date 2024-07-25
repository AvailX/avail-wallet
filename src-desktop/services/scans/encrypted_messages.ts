import { invoke } from '@tauri-apps/api/core';
import { type TxScanResponse } from '../../types/events';
import { AvailError } from '../../types/errors';

export async function scan_messages() {
	return invoke<TxScanResponse>('txs_sync');
}
