import {type Balance} from 'src/services/wallet-connect/WCTypes';

export type AssetType = {
	image_ref: string | undefined;
	symbol: string;
	balance: Balance;
	total: number;
	value: number;
};
