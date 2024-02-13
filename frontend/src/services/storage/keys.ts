import { invoke } from "@tauri-apps/api/core";

export async function getPrivateKey(password: string | undefined) {
    const res: string = await invoke("get_private_key_tauri", { password: password });
    return res;
}

export async function getViewingKey(password: string | undefined) {
    const res: string = await invoke("get_view_key_tauri", { password: password });
    return res;
}

export async function getSeedPhrase(password: string | undefined) {
    const res: string = await invoke("get_seed_phrase", { password: password });
    return res;
}