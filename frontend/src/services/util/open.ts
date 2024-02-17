import { invoke } from "@tauri-apps/api/core";

export async function open_url(url: string){
    return invoke("open_url", { url: url })
}