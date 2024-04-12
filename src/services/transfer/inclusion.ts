import {invoke} from '@tauri-apps/api/core';

export async function pre_install_inclusion_prover() {
	console.log('====> snarkVM Deploy Test');
	let fin = await invoke('pre_install_inclusion_prover').then(res => { console.log('====> After prover '); return res; }).catch((err) => { console.log("ERR",err); })

	return fin;
}
