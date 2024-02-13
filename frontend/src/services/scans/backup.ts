import { invoke } from "@tauri-apps/api/core";

export async function sync_backup() {
    
    return invoke("sync_backup")
}