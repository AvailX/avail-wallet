

// Username
import { getUsername } from '../storage/persistent';
import { get_address } from '../storage/persistent';


// Balance
import { get_balance, get_total_balance } from '../tokens/get_balance';
import { type GetBalancesRequest } from '../wallet-connect/WCTypes';

{/* --Get Username-- */ }
export const getName = async (setUsername: React.Dispatch<React.SetStateAction<string>>) => {
	const username = await getUsername();
	if (username == '#0') {
		setUsername('Add Username');
		return;
	}

	setUsername(username);
};

{/* --Get Address-- */ }
export const getAddress = async (setAddress: React.Dispatch<React.SetStateAction<string>>) => {
	const address = await get_address();
	setAddress(address);
};

{/* --Get Wallet Balance-- */ }
export const getTokenBalance = async (asset_id: string) => {
	console.log('ASSSSSE ID', asset_id);
	const request: GetBalancesRequest = {
		assetId: asset_id,
	};
	console.log('Params passsed in FE', request);
	const bal = await get_balance(request);
	return bal;
};

// TODO - get total wallet balance for all tokens
export const getTotalBalance = async () => {
	const bal = await get_total_balance();

	return bal;
};

