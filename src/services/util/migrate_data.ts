import {invoke} from '@tauri-apps/api/core';

 export async function updateData() {
 	return invoke('migrate_encrypted_data');
 }