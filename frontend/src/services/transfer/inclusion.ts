import { invoke } from "@tauri-apps/api/core";


export async function pre_install_inclusion_prover() {
    return invoke("pre_install_inclusion_prover");
}