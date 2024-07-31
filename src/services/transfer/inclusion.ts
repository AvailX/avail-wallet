import {invoke} from '@tauri-apps/api/core';

export async function preInstallInclusionProver() {
	return invoke('pre_install_inclusion_prover');
}
