export type token = {
	symbol: string;
	image_url: string;
};

export type TokenProps = {
	tokens: token[];
	token: string;
	amount: number | undefined;
	setToken: React.Dispatch<React.SetStateAction<string>>;
	setAmount: React.Dispatch<React.SetStateAction<number>>;
};

export enum TransferType {
	TransferPublic,
	TransferPrivate,
	TransferPublicToPrivate,
	TransferPrivateToPublic,
}

export type TransferRequest = {
	recipient: string;
	amount: number;
	message: string | undefined;
	password: string | undefined;
	transfer_type: TransferType;
	fee_private: boolean;
	fee: number;
	asset_id: string;
};
