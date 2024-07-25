import { invoke } from '@tauri-apps/api/core';
import { AvailError } from '../../types/errors';
import { type TransferRequest } from '../../types/transfer_props/tokens';

export async function transfer(request: TransferRequest, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>) {
	return invoke('transfer', { request });
}
