import { invoke } from "@tauri-apps/api/core";

import { AssetType } from "src/types/assets/asset";

export async function getTokens(){
    const res:AssetType[] = await invoke("get_tokens",{});
    return res;
}

export async function getToken(asset_id: string){
    const res:AssetType = await invoke("get_token",{request: asset_id});
    return res;
}