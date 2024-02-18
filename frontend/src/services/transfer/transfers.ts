import {invoke} from '@tauri-apps/api/core';
import {AvailError} from 'src/types/errors';
import {type TransferRequest} from 'src/types/transfer_props/tokens';

export async function transfer(request: TransferRequest, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>) {
	return invoke('transfer', {request});
}
