import {invoke} from '@tauri-apps/api/core';
import {type AssetType} from 'src/types/assets/asset';
import {getTokenBalance} from '../states/utils';
import aleo from '../../assets/images/tokens/ALEO.svg';
import usdc from '../../assets/images/tokens/USDC.svg';

function parseTokenName(name: string) {
	return name.split('.')[0];
}

/// returns all asset ids stored
export async function get_stored_tokens() {
	const res: string[] = await invoke('get_stored_tokens');
	return res;
}

/// returns all tokens as AssetType
export async function handleGetTokens() {
	const tokens = await get_stored_tokens();

	console.log('Tokens: ' + tokens);

	if ((tokens.length === 0 || !tokens.includes('credits')) && !tokens.includes('credits.record')) {
		tokens.push('credits');
	}

	const assets: AssetType[] = [];
	let balance_sum = 0;

	for (const i in tokens) {
		const balance_response = await getTokenBalance(tokens[i]);

		console.log(balance_response);
		if (balance_response.balances !== undefined) {
			const token_balance = balance_response.balances[0];

            //round to 3 decimal places
            token_balance.private = Math.round((token_balance.private + Number.EPSILON) * 1000) / 1000;
            token_balance.public = Math.round((token_balance.public + Number.EPSILON) * 1000) / 1000;

            let token_total = token_balance.private + token_balance.public;
            token_total = Math.round((token_total + Number.EPSILON) * 1000) / 1000;

			let symbol = parseTokenName(tokens[i]);
			let image_reference;

			if (symbol === 'credits') {
				symbol = 'ALEO';
				image_reference = aleo;
			} else if (symbol === 'usdc') {
				image_reference = usdc;
			}

			const token_asset: AssetType = {
				image_ref: image_reference,
				symbol: symbol.toUpperCase(),
				total: token_total,
				balance: token_balance,
				value: 1,
			};

			assets.push(token_asset);
			balance_sum += token_total;
		}
	}

	return {assets, balance_sum};
}

// TODO - Get tokens to spend in Transfer page, symbol is asset_id !be careful of caps!
