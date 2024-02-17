import { invoke } from "@tauri-apps/api/core";

import { AssetType } from "src/types/assets/asset";
import { getTokenBalance } from "../states/utils";

import aleo from '../../assets/images/tokens/ALEO.svg';
import usdc from '../../assets/images/tokens/USDC.svg';

function parseTokenName(name: string){
    return name.split(".")[0];
}

/// returns all asset ids stored
export async function get_stored_tokens() {
    const res: string[] = await invoke("get_stored_tokens");
    return res;
}

/// returns all tokens as AssetType
export async function handleGetTokens() {
    let tokens = await get_stored_tokens();

    console.log("Tokens: "+tokens)

    if ((tokens.length === 0 || !tokens.includes("credits")) && !tokens.includes("credits.record")) {
       tokens.push("credits");
    }

    let assets: AssetType[] = [];
    let balance_sum = 0;

    for (let i in tokens) {
        let balance_response = await getTokenBalance(tokens[i]);

        console.log(balance_response);
        if (balance_response.balances !== undefined) {
            const token_balance = balance_response.balances[0];

            //round to 2 decimal places
            token_balance.private = Math.round((token_balance.private + Number.EPSILON) * 100) / 100;
            token_balance.public = Math.round((token_balance.public + Number.EPSILON) * 100) / 100;

            let token_total = token_balance.private + token_balance.public;
            token_total = Math.round((token_total + Number.EPSILON) * 100) / 100;


            let symbol = parseTokenName(tokens[i]);
            let image_ref = null;

            if (symbol === "credits") {
                symbol = "ALEO"
                image_ref = aleo;
            } else if (symbol === "usdc") {
                image_ref = usdc;
            }

            const token_asset: AssetType = {
                image_ref: image_ref,
                symbol: symbol.toUpperCase(),
                total: token_total,
                balance: token_balance,
                value: 1.00
            }

            assets.push(token_asset);
            balance_sum += token_total;
        }
    }

    return { assets, balance_sum };
}

// TODO - Get tokens to spend in Transfer page, symbol is asset_id !be careful of caps!