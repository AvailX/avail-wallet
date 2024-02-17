import { invoke } from "@tauri-apps/api/core";

export async function scan_blocks(height: number, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>) {
    
    return invoke<boolean>("blocks_sync", {height:height})
}