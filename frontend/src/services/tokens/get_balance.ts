import { invoke } from "@tauri-apps/api/core";

import { Balance,GetBalancesRequest, GetBalancesResponse } from "../wallet-connect/WCTypes";

export async function get_balance(request: GetBalancesRequest){
    const res: GetBalancesResponse = await invoke("get_balance",{request: request});
    return res;
}

// TODO - What should be the metric of total balance?
export async function get_total_balance(){
    const res: GetBalancesResponse = await invoke("get_balance",{request: {assetId: ""}});
    return res;
}