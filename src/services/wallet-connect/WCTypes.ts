export const aleoChain = 'aleo:1';

export enum AleoMethod {
	ALEO_GETBALANCE = 'getBalance',
	ALEO_DISCONNECT = 'disconnect',
	ALEO_GETACCOUNT = 'getSelectedAccount',
	ALEO_DECRYPT = 'decrypt',
	ALEO_SIGN = 'requestSignature',
	ALEO_GET_RECORDS = 'getRecords',
	ALEO_CREATE_EVENT = 'requestCreateEvent',
	ALEO_GET_EVENT = 'getEvent',
	ALEO_GET_EVENTS = 'getEvents',
	ALEO_CREATE_STATE = 'createSharedState', // Not for now
	ALEO_IMPORT_STATE = 'importSharedState', // Not for now
}

export enum AleoEvents {
	chainChanged = 'chainChanged',
	accountSelected = 'accountSelected',
	selectedAccountSynced = 'selectedAccountSynced',
	sharedAccountSynced = 'sharedAccountSynced',
}

export type AleoMethodRequest = {
	[AleoMethod.ALEO_GETBALANCE]: GetBalancesRequest;
	[AleoMethod.ALEO_GETACCOUNT]: any;
	[AleoMethod.ALEO_DECRYPT]: DecryptRequest;
	[AleoMethod.ALEO_SIGN]: SignatureRequest;
	[AleoMethod.ALEO_DISCONNECT]: any;
	[AleoMethod.ALEO_GET_RECORDS]: GetRecordsRequest;
	[AleoMethod.ALEO_CREATE_EVENT]: CreateEventRequest;
	[AleoMethod.ALEO_GET_EVENT]: GetEventRequest;
	[AleoMethod.ALEO_GET_EVENTS]: GetEventsRequest;
	[AleoMethod.ALEO_CREATE_STATE]: any;
	[AleoMethod.ALEO_IMPORT_STATE]: ImportSharedStateRequest;
};

export type WalletConnectRequest = {
	method: string;
	question: string;
	imageRef: string;
	approveResponse: string;
	rejectResponse: string;
	// Dapp metadata
	description?: string;
	dappImage?: string;
	dappUrl?: string;
	// Possible parameters
	fee?: string;
	asset_id?: string;
	programId?: string;
	program_ids?: string[];
	functionId?: string;
	inputs?: string[];
	ciphertexts?: string[];
	type?: string;
	message?: string;
};

// Stores dapp metadata to display to user
export type DAppSession = {
	name: string;
	description: string;
	url: string;
	img: string;
};

export const dappSession = (
	name: string,
	description: string,
	url: string,
	img: string,
): DappSession => ({
	name,
	description,
	url,
	img,
});

export type RequestSession = {
	method: string;
	request: string;
	expiry: Date;
};

// ALEO_GETBALANCE: 'getBalance'
export type GetBalancesRequest = {
	assetId?: string;
	address?: string;
};
export type GetBalancesResponse = {
	balances?: Balance[]; // [ALEO, PIECES];
	error?: string;
};
export type Balance = {
	private: number;
	public: number;
};

// ALEO_GETACCOUNT: 'getSelectedAccount'
export type GetSelectedAccountResponse = {
	account?: Account;
	error?: string;
};
export type Account = {
	network: string;
	chainId: string;
	address: string;
	shortenedAddress: string;
};

export const shortenAddress = (address: string) => {
	const length = 5;
	if (address.length < length * 2) {
		return address;
	}

	return `${address.slice(0, length + 'aleo1'.length)}...${address.slice(
		address.length - length,
		address.length,
	)}`;
};

/* --Sign-- */
export type SignatureRequest = {
	message: string;
	address?: string;
};
export type SignatureResponse = {
	signature?: string;
	messageFields?: string;
	error?: string;
};

/* --GetRecords-- */
export type GetRecordsRequest = {
	address?: string;
	filter?: RecordsFilter;
	page?: number;
};
export type RecordsFilter = {
	programIds?: string[];
	functionId?: string;
	type: 'all' | 'spent' | 'unspent';
};

export type GetRecordsResponse = {
	records?: RecordWithPlaintext[];
	pageCount?: number;
	error?: string;
};

export type GetBackendRecordsResponse = {
	records?: [BackendRecordWithPlaintext];
	pageCount?: number;
	error?: string;
};

export const convertGetRecordsResponse = (
	response: GetBackendRecordsResponse,
): GetRecordsResponse => {
	const {records} = response;
	const convertedRecords: RecordWithPlaintext[] | undefined = [];

	if (records) {
		records.forEach(record => {
			convertedRecords?.push(convertRecord(record));
		});
	}

	return {
		records: response.records ? convertedRecords : [],
		pageCount: response.pageCount,
		error: response.error,
	};
};

export type RecordWithPlaintext = Record & {
	plaintext: string;
	data: Record;
};

export type BackendRecordWithPlaintext = {
	record: Record;
	plaintext: string;
	data: Record;
};

// Function to convert from backend record to frontend record
export const convertRecord = (
	record: BackendRecordWithPlaintext,
): RecordWithPlaintext => ({
	...record.record,
	plaintext: record?.plaintext,
	data: record?.data,
});

export type Record = {
	// From @puzzlehq/types
	_id: string;
	eventId: string;
	height: number;
	ciphertext: string;
	programId: string;
	functionId: string;
	transitionId: string;
	transactionId: string;
	owner: string;
	spent: boolean;
	serialNumber?: string;
};

/** Type for Avail Events
 * - Avail Events are events that have been broadcasted to the network and are awaiting confirmation
 */
export type AvailEvent = {
	_id: string;
	type: EventType;
	owner: string;
	status: AvailEventStatus;
	created: Date;
	broadcast?: Date;
	broadcast_height?: number;
	settled?: Date;
	network: Network;
	transactionId?: string;
	programId?: string;
	functionId?: string;
	inputs: Array<string | undefined>;
	transitions: EventTransition[];
	fee_transition?: EventTransition;
	height?: number;
	description?: string;
	fee?: number;
	visibility: Visibility;
	error?: string;
	message?: string;
	to?: string;
	from?: string;
	amount?: number;
};

export type Event = {
	_id: string;
	type: EventType;
	owner: string;
	status: EventStatus;
	created: Date;
	broadcast?: Date;
	broadcast_height?: number;
	settled?: Date;
	network: Network;
	transactionId?: string;
	programId?: string;
	functionId?: string;
	inputs: Array<string | undefined>;
	tranitions: EventTransition[];
	fee_transition?: EventTransition;
	height?: number;
	description?: string;
	fee?: number;
	visibility: Visibility;
	error?: string;
};

export type EventTransition = {
	transitionId: string;
	programId: string;
	functionId: string;
	inputs: Array<string | undefined>;
	outputs: Array<string | undefined>;
};

export enum Network {
	AleoTestnet = 'AleoTestnet',
	AleoMainnet = 'AleoMainnet',
}

export enum Visibility {
	Private = 'Private',
	Public = 'Public',
}

export enum EventStatus {
	Creating = 'Creating',
	Pending = 'Pending',
	Settled = 'Settled',
	Failed = 'Failed',
}

export enum AvailEventStatus {
	Processing = 'Processing',
	Pending = 'Pending',
	Confirmed = 'Confirmed',
	Failed = 'Failed',
	Rejected = 'Rejected',
	Aborted = 'Aborted',
	Cancelled = 'Cancelled',
}

export type CreateEventRequest = {
	address?: string;
	type: EventType;
	programId: string;
	functionId: string;
	fee: number;
	inputs: string[];
};

export enum EventType {
	Deploy = 'Deploy',
	Execute = 'Execute',
	Send = 'Send',
	Receive = 'Receive',
	Join = 'Join',
	Split = 'Split',
	Shield = 'Shield',
	Unshield = 'Unshield',
}
export type CreateEventResponse = {
	eventId?: string;
	error?: string;
};

export type GetEventRequest = {
	id: string;
	address?: string;
};
export type GetEventResponse = {
	event?: Event;
	error?: string;
};

export type GetEventsRequest = {
	filter?: EventsFilter;
	page?: number;
};

export type EventsFilter = {
	type?: EventType;
	programId?: string;
	functionId?: string;
};

export type GetEventsResponse = {
	events?: Event[];
	pageCount?: number;
	error?: string;
};

export type GetAvailEventsResponse = {
	events?: AvailEvent[];
	pageCount?: number;
	error?: string;
};

export type GetAvailEventResponse = {
	event?: AvailEvent;
	error?: string;
};

export type DecryptRequest = {
	ciphertexts: string[];
};

export type DecryptResponse = {
	plaintexts?: string[];
	error?: string;
};

// Not Implemented
/* --Shared State-- */
export type CreateSharedStateResponse = {
	data?: {
		seed: string;
		address: string;
	};
	error?: string;
};

export type ImportSharedStateRequest = {
	seed: string;
};

export type ImportSharedStateResponse = {
	data?: {
		address: string;
		seed: string;
	};
	error?: string;
};

// Make an array of two test Avail Events one a transfer of type Send and another of type Execute
export const testEvents: AvailEvent[] = [
	{
		_id: '1',
		type: EventType.Receive,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(Date.now() - 24 * 60 * 60 * 1000),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '20000000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'20000000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['300000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 20000u64,data: {}}'],
		},
		height: 123_456,
		description: 'Private transfer',
		fee: undefined,
		visibility: Visibility.Private,
		message: 'Hey, thanks for the beer.',
		to: undefined,
		from: 'Satoshi',
		amount: 20,
	},
	{
		_id: '2',
		type: EventType.Execute,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'avail_disruptors.aleo',
		functionId: 'mint_private',
		inputs: ['record1zkp7a76879868433b38qy83692835b3193'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'avail_disruptors.aleo',
				functionId: 'mint_private',
				inputs: ['record1zkp7a76879868433b38qy83692835b3193'],
				outputs: [
					'{owner: aleo1zkp731567351bjbh13,amount: 100u64, data:{ bytes1: 0x001010210102011010021010101, bytes2: 0x001010210102011010021010101}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 1',
		fee: 1.4,
		visibility: Visibility.Private,
		message: undefined,
		to: undefined,
		from: undefined,
	},
];

export const testCreditsEvents: AvailEvent[] = [
	{
		_id: '2',
		type: EventType.Send,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '10000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'10000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 2',
		fee: 0.01,
		visibility: Visibility.Private,
		message: undefined,
		to: 'Julian',
		from: undefined,
		amount: 10_000,
	},
	{
		_id: '2',
		type: EventType.Send,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '10000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'10000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 2',
		fee: 0.01,
		visibility: Visibility.Private,
		message: undefined,
		to: 'Julian',
		from: undefined,
		amount: 10_000,
	},
	{
		_id: '2',
		type: EventType.Send,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '10000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'10000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 2',
		fee: 0.01,
		visibility: Visibility.Private,
		message: undefined,
		to: 'Julian',
		from: undefined,
		amount: 10_000,
	},
	{
		_id: '2',
		type: EventType.Send,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '10000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'10000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 2',
		fee: 0.01,
		visibility: Visibility.Private,
		message: undefined,
		to: 'Julian',
		from: undefined,
		amount: 10_000,
	},
];

export const testCreditsEvents2: AvailEvent[] = [
	{
		_id: '1',
		type: EventType.Send,
		owner:
      'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
		status: AvailEventStatus.Confirmed,
		created: new Date(Date.now() - 24 * 60 * 60 * 1000),
		broadcast: new Date(),
		settled: new Date(),
		network: Network.AleoTestnet,
		transactionId:
      'at13wfnwclps34fhy58hpxskv0z027kzqjklwhy9fecntrhnmlpauqq7n0y8q',
		programId: 'credits.aleo',
		functionId: 'transfer_private',
		inputs: ['aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9', '10000u64'],
		transitions: [
			{
				transitionId:
          'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
				programId: 'credits.aleo',
				functionId: 'transfer_private',
				inputs: [
					'aleo1q0w3s2x5y4z6u8t7r9p0o2i3u4y5t6r7e8w9',
					'10000u64',
					'recordajbvajnvjnavjen',
				],
				outputs: [
					'recordzkp1cakjuvnaodvmsocipjhernjavva..',
					'{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}',
				],
			},
		],
		fee_transition: {
			transitionId:
        'au1070w2eknk90ldz2rs88p8erdjq5we4787hr702pf3lmzxsr4kg8sr5lran',
			programId: 'credits.aleo',
			functionId: 'fee_private',
			inputs: ['10000u64', 'recordajbvajnvjnavjen'],
			outputs: ['{owner: aleozkp1ausajvbjav... ,amount: 9994u64,data: {}}'],
		},
		height: 123_456,
		description: 'test event 2',
		fee: 0.28,
		visibility: Visibility.Private,
		message: undefined,
		to: 'zack_x',
		from: undefined,
		amount: 2,
	},
];
