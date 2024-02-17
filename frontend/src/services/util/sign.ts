import { invoke } from "@tauri-apps/api/core";
import { SignatureRequest,SignatureResponse } from "../wallet-connect/WCTypes";


export async function sign(message: string){
let request : SignatureRequest = {
    message: message
}

return invoke<SignatureResponse>("sign", { request: request })
}

export async function verify(message: string, signature: string, address: string){
    return invoke<boolean>("verify",{message: message, address: address,signature: signature})
}

