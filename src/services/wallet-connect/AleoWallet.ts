/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import {invoke} from '@tauri-apps/api/core';
import {once, type Event} from '@tauri-apps/api/event';
import {type WebviewOptions} from '@tauri-apps/api/webview';
import {getAll, WebviewWindow} from '@tauri-apps/api/webviewWindow';
import {type Window, type WindowOptions} from '@tauri-apps/api/window';
import {
	formatJsonRpcError,
	formatJsonRpcResult,
	type JsonRpcError,
	type JsonRpcResult,
} from '@walletconnect/jsonrpc-utils';
import {type Web3WalletTypes} from '@walletconnect/web3wallet';
import {type AvailError} from '../../types/errors';
import {
	aleoChain,
	AleoEvents,
	AleoMethod,
	type CreateEventResponse,
	EventType,
	shortenAddress,
	type CreateEventRequest,
	type DAppSession,
	type DecryptRequest,
	type DecryptResponse,
	type GetBalancesRequest,
	type GetBalancesResponse,
	type GetSelectedAccountResponse,
	type SignatureRequest,
	type SignatureResponse,
	type WalletConnectRequest,
	type GetEventRequest,
	type GetEventsRequest,
	type GetEventResponse,
	type GetEventsResponse,
	type GetRecordsRequest,
	type GetRecordsResponse,
	type GetBackendRecordsResponse,
	convertGetRecordsResponse,
} from './WCTypes';

function checkWindow(reference: string) {
	return getAll().some(win => win.label === reference);
}

/**
 * Get the window object from the window list
 * @param windowLabel - The window label
 * @returns The WebviewWindow object
 */
function getWindow(windowLabel: string): WebviewWindow | undefined {
	return getAll().find(win => win.label === windowLabel);
}

/**
 * Get the window object from the window list or create a new one if it doesn't exist
 * @param windowLabel - The window label
 * @param options - The window options
 * @returns The WebviewWindow object
 */
function getWindowOrCreate(
	windowLabel: string,
	options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> &
	WindowOptions,
): WebviewWindow {
	const window = getWindow(windowLabel);
	if (window) {
		return window;
	}

	return new WebviewWindow(windowLabel, options);
}

/**
 * Emit an event after a number of seconds
 * @param window The tauri webview window
 * @param event The label of the event to emit
 * @param payload The payload to emit
 * @param seconds The number of seconds to wait before emitting the event
 */
function emitAfterSeconds(
	window: WebviewWindow,
	event: string,
	payload: any,
	seconds: number,
) {
	setTimeout(async () => {
		await window.emit(event, payload);
	}, seconds * 1000);
}

// TODO - Switch to pairing topic or dapp name as key to sessionStorage entry
/**
 * Get the DApp session metadata from the session storage
 * @param session_topic The wallet connect session topic
 * @returns The DApp session metadata
 */
function getDappMetadata(session_topic: string): DAppSession | undefined {
	const dappSessionString = sessionStorage.getItem(session_topic);

	if (dappSessionString) {
		const dappSession: DAppSession = JSON.parse(
			dappSessionString,
		) as DAppSession;
		return dappSession;
	}
}

function storeSession(unique_request_id: string) {
	const expiry = new Date();
	expiry.setHours(expiry.getHours() + 1);

	sessionStorage.setItem(unique_request_id, expiry.toISOString());
}

function checkExpired(unique_request_id: string) {
	const expiryString = sessionStorage.getItem(unique_request_id);

	if (expiryString !== null) {
		const expiry = new Date(expiryString);
		const now = new Date();

		if (now > expiry) {
			sessionStorage.removeItem(unique_request_id);
			return true;
		}

		return false;
	}

	return true;
}

function checkNotExpired(unique_request_id: string) {
	const expiryString = sessionStorage.getItem(unique_request_id);

	if (expiryString) {
		const now = new Date();
		const expiry = new Date(expiryString);

		if (now < expiry) {
			return true;
		}

		sessionStorage.removeItem(unique_request_id);
		return false;
	}

	return false;
}

export async function createWalletConnectDialog(
	dialogConfig: {
		onApprove: (response: Event<unknown>, webview: WebviewWindow) => Promise<JsonRpcResult | JsonRpcError | void>;
		onReject: (response: Event<unknown>) => Promise<JsonRpcResult | JsonRpcError | void>;
		approveEventString: string;
		rejectEventString: string;
		requestType: AleoMethod;
		requestIdentifier: string;
		requestEvent?: Web3WalletTypes.SessionRequest;
	},
	wcRequest: WalletConnectRequest,
): Promise<JsonRpcResult | JsonRpcError> {
	return new Promise((resolve, reject) => {
		const webview = getWindowOrCreate('wallet-connect', {
			url: 'wallet-connect-screens/wallet-connect.html',
			title: 'Avail Wallet Connect',
			width: 390,
			height: 680,
			resizable: false,
		});

		emitAfterSeconds(webview, 'wallet-connect-request', wcRequest, 3);

		// Register approve listener
		once(dialogConfig.approveEventString, async response => {
			storeSession(dialogConfig.requestIdentifier);
			console.log('Approve listener triggered');
			dialogConfig
				.onApprove(response, webview)
				.then(async response => {
					await webview.destroy();

					if (response !== undefined) {
						resolve(response);
						console.log('Approve listener resolved');
					}
				})
				.catch(response => {
					reject(response);
				});
		})
			.then(() => {
				console.log('Approve listener registered');
			})
			.catch((error: any) => {
				console.error(error);
			});

		// Register reject listener
		once(dialogConfig.rejectEventString, async response => {
			await webview.destroy();
			dialogConfig
				.onReject(response)
				.then(response => {
					if (response !== undefined) {
						resolve(response);
					}
				})
				.catch(response => {
					reject(response);
				});
		})
			.then(() => {
				console.log('Reject listener registered');
			})
			.catch((error: any) => {
				console.error(error);
			});
	});
}

export class AleoWallet {
	publicKey?: string;

	constructor(public_key?: string) {
		this.publicKey = public_key;
	}

	getAddress(): string | undefined {
		return this.publicKey;
	}

	chainName(): string {
		console.log('AleoChain', aleoChain);
		return aleoChain;
	}

	chainMethods(): string[] {
		console.log('AleoMethod', Object.keys(AleoMethod));
		return Object.values(AleoMethod);
	}

	chainEvents(): string[] {
		console.log('AleoEvents', Object.keys(AleoEvents));
		return Object.keys(AleoEvents);
	}

	// Handles any method calls from the DApp
	async invokeMethod(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const requestMethod = requestEvent.params.request.method;

		switch (requestMethod as AleoMethod) {
			case AleoMethod.ALEO_GETBALANCE: {
				return this.handleBalanceRequest(requestEvent);
			}

			case AleoMethod.ALEO_GETACCOUNT: {
				return this.handleAccountRequest(requestEvent);
			}

			case AleoMethod.ALEO_DECRYPT: {
				return this.handleDecrypt(requestEvent);
			}

			case AleoMethod.ALEO_SIGN: {
				return this.handleSign(requestEvent);
			}

			case AleoMethod.ALEO_CREATE_EVENT: {
				return this.handleCreateRequestEvent(requestEvent);
			}

			case AleoMethod.ALEO_GET_EVENT: {
				return this.handleGetEvent(requestEvent);
			}

			case AleoMethod.ALEO_GET_EVENTS: {
				return this.handleGetEvents(requestEvent);
			}

			case AleoMethod.ALEO_GET_RECORDS: {
				return this.handleGetRecords(requestEvent);
			}

			default: {
				console.log(`Method unsupported ${requestMethod}`);
				return formatJsonRpcError(
					requestEvent.id,
					`Method unsupported ${requestMethod}`,
				);
			}
		}
	}

	private async handleBalanceRequest(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request.params as GetBalancesRequest;

		const requestIdentifier
      = 'getBalance' + (metadata?.name ?? '') + request.assetId;

		let {assetId} = request;
		if (assetId === 'credits' || assetId === undefined) {
			assetId = 'Aleo Credits';
		}

		if (checkNotExpired(requestIdentifier)) {
			return new Promise((resolve, reject) => {
				invoke<GetBalancesResponse>('get_balance', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(
							new Error(
								formatJsonRpcError(
									requestEvent.id,
									error.external_msg,
								).error.data,
							),
						);
					});
			});
		}

		const wcRequest: WalletConnectRequest = {
			method: 'balance',
			question: (metadata?.name ?? 'Someone') + ' wants to share your balance',
			imageRef: '../wc-images/balance.svg',
			approveResponse: 'User approved the balance share.',
			rejectResponse: 'User rejected the balance share.',
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			asset_id: assetId,
		};

		return createWalletConnectDialog(
			{
				async onApprove() {
					const response = await invoke<GetBalancesResponse>('get_balance', {
						request,
					});
					return formatJsonRpcResult(requestEvent.id, response);
				},
				onReject: async () =>
					formatJsonRpcError(requestEvent.id, 'User rejected balance share'),
				approveEventString: 'balance-approved',
				rejectEventString: 'balance-rejected',
				requestType: AleoMethod.ALEO_GETBALANCE,
				requestIdentifier,
				requestEvent,
			},
			wcRequest,
		);
	}

	private async handleAccountRequest(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		try {
			const aleoAddress = this.getAddress()!;

			const response: GetSelectedAccountResponse = {
				account: {
					network: 'aleo',
					chainId: '1',
					address: aleoAddress,
					shortenedAddress: shortenAddress(aleoAddress),
				},
			};
			return formatJsonRpcResult(requestEvent.id, response);
		} catch (error: any) {
			return formatJsonRpcError(requestEvent.id, error.message as string);
		}
	}

	private async handleDecrypt(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request.params as DecryptRequest;

		const requestIdentifier = 'decrypt' + (metadata?.name ?? '');

		async function action(): Promise<JsonRpcResult | JsonRpcError> {
			return new Promise((resolve, reject) => {
				invoke<DecryptResponse>('decrypt_records', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		if (checkNotExpired(requestIdentifier)) {
			return action();
		}

		const wcRequest: WalletConnectRequest = {
			method: 'decrypt',
			question:
        (metadata?.name ?? 'Someone?')
        + ' wants you to decrypt and share these records',
			imageRef: '../wc-images/decrypt.svg',
			approveResponse: 'User approved decryption.',
			rejectResponse: 'User rejected decryption.',
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
			ciphertexts: request.ciphertexts,
		};

		return createWalletConnectDialog(
			{
				onApprove: action,
				onReject: async () =>
					formatJsonRpcError(requestEvent.id, 'User rejected decryption'),
				approveEventString: 'decrypt-approved',
				rejectEventString: 'decrypt-rejected',
				requestType: AleoMethod.ALEO_DECRYPT,
				requestIdentifier,
				requestEvent,
			},
			wcRequest,
		);
	}

	private async handleSign(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request.params as SignatureRequest;

		const wcRequest: WalletConnectRequest = {
			method: 'sign',
			question:
        (metadata?.name ?? 'Someone?') + ' wants you to sign this message',
			imageRef: '../wc-images/sign.svg',
			approveResponse: 'User approved signature.',
			rejectResponse: 'User rejected signature.',
			message: request.message,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		async function action(): Promise<JsonRpcResult | JsonRpcError> {
			return new Promise((resolve, reject) => {
				invoke<SignatureResponse>('sign', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		return createWalletConnectDialog(
			{
				onApprove: action,
				onReject: async () =>
					formatJsonRpcError(requestEvent.id, 'User rejected signature'),
				approveEventString: 'sign-approved',
				rejectEventString: 'sign-rejected',
				requestType: AleoMethod.ALEO_SIGN,
				requestIdentifier: 'sign' + (metadata?.name ?? ''),
				requestEvent,
			},
			wcRequest,
		);
	}

	// This function handles both execution and deployments dependant on EventType
	private async handleCreateRequestEvent(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request.params as CreateEventRequest;
		console.log('===========> Request full', request);
		// TODO - User fee privacy choice
		const wcRequest: WalletConnectRequest = {
			method: 'create-request-event',
			question:
        (metadata?.name ?? 'Someone?')
        + ' wants to '
        + (request.type === EventType.Deploy ? 'deploy' : 'execute')
        + ' a program',
			imageRef: '../wc-images/deploy.svg',
			approveResponse:
        'User approved '
        + (request.type === EventType.Deploy ? 'deployment' : 'execution')
        + ' event.',
			rejectResponse:
        'User rejected '
        + (request.type === EventType.Deploy ? 'deployment' : 'execution')
        + ' event.',
			fee: request.fee.toString(),
			programId: request.programId,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
			inputs: request.type === EventType.Deploy ? undefined : request.inputs,
			functionId:
        request.type === EventType.Deploy ? undefined : request.functionId,
		};

		return createWalletConnectDialog(
			{
				async onApprove(response, webview) {
					await webview.destroy();

					return new Promise((resolve, reject) => {
						console.log('Response', response);
						const payloadObject = JSON.stringify(response.payload);
						const feeOption = JSON.parse(payloadObject).feeOption;
						console.log('Fee Option', feeOption);

						invoke<CreateEventResponse>('request_create_event', {
							request,
							fee_private: feeOption,
						})
							.then(response => {
								resolve(formatJsonRpcResult(requestEvent.id, response));
							})
							.catch((error: AvailError) => {
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					});
				},
				onReject: async () =>
					formatJsonRpcError(
						requestEvent.id,
						'User rejected '
              + (request.type === EventType.Deploy ? 'deployment' : 'execution')
              + ' event',
					),
				approveEventString: 'create-request-event-approved',
				rejectEventString: 'create-request-event-rejected',
				requestType: AleoMethod.ALEO_CREATE_EVENT,
				requestIdentifier:
          'createRequestEvent' + (metadata?.name ?? '') + request.programId,
				requestEvent,
			},
			wcRequest,
		);
	}

	private async handleGetEvent(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as GetEventRequest;

		const request_identifier = 'getEvent' + metadata?.name + request.id;

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<GetEventResponse>('get_event', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: WalletConnectRequest = {
			method: 'get-event',
			question: metadata?.name + ' wants to share this event',
			imageRef: '../wc-images/tx.svg',
			approveResponse: 'User approved get event.',
			rejectResponse: 'User rejected get event.',
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: WebviewWindow;

		if (checkWindow('wallet-connect')) {
			for (const win of getAll()) {
				if (win.label === 'wallet-connect') {
					webview = win;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('wallet-connect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			const unlistenCreated = await webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			const unlistenError = await webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(async () => {
			await webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = once(
				'get-event-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					await webview.destroy();
					storeSession(request_identifier);

					try {
						invoke<GetEventResponse>('get_event', {request})
							.then(response => {
								resolve(formatJsonRpcResult(requestEvent.id, response));
							})
							.catch((error: AvailError) => {
								console.error(error);
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					} catch (error: any) {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.message));
					}
				},
			);

			const unlistenRejected = once(
				'get-event-rejected',
				async response => {
					const unlisten = await unlistenRejected;

					unlisten();
					await webview.destroy();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}

	private async handleGetEvents(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as GetEventsRequest;

		const request_identifier
      = 'getEvents'
      + metadata?.name
      + request.filter?.functionId
      + request.filter?.programId;

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<GetEventsResponse>('get_events', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: WalletConnectRequest = {
			method: 'get-events',
			question: metadata?.name + ' wants you to share your transaction history',
			imageRef: '../wc-images/transactions.svg',
			approveResponse: 'User approved get events.',
			rejectResponse: 'User rejected get events.',
			programId: request.filter?.programId,
			functionId: request.filter?.functionId,
			type: request.filter?.type,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: WebviewWindow;

		if (checkWindow('wallet-connect')) {
			for (const win of getAll()) {
				if (win.label === 'wallet-connect') {
					webview = win;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('wallet-connect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			await webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			await webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(async () => {
			await webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = once(
				'get-events-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();

					await webview.destroy();
					storeSession(request_identifier);

					try {
						invoke<GetEventsResponse>('get_events', {request})
							.then(response => {
								resolve(formatJsonRpcResult(requestEvent.id, response));
							})
							.catch((error: AvailError) => {
								console.error(error);
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					} catch (error: any) {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.message));
					}
				},
			);

			const unlistenRejected = once(
				'get-events-rejected',
				async response => {
					const unlisten = await unlistenRejected;
					unlisten();
					await webview.destroy();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}

	private async handleGetRecords(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as GetRecordsRequest;

		const request_identifier
      = 'getRecords'
      + metadata?.name
      + request.filter?.functionId
      + request.filter?.programIds;
		if (request?.filter) {
			console.log('==> Request', request);
			console.log('==> PID\'s', request.filter?.programIds);
			if (request.filter.programIds === undefined) {
				request.filter.programIds = [];
			} else if (request.filter.programIds.length === 0) {
				request.filter.programIds = [];
			} else if (request.filter.programIds === null) {
				request.filter.programIds = [];
			} else if (request.filter.programIds.toLocaleString() === '') {
				request.filter.programIds = [];
			}
		}

		console.log('PID\'s After empty value handling', request.filter?.programIds);

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<GetBackendRecordsResponse>('get_records', {request})
					.then(response => {
						const res = convertGetRecordsResponse(response);
						resolve(formatJsonRpcResult(requestEvent.id, res));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: WalletConnectRequest = {
			method: 'get-records',
			question: metadata?.name + ' wants you to share your records',
			imageRef: '../wc-images/transactions.svg',
			approveResponse: 'User approved get records.',
			rejectResponse: 'User rejected get records.',
			program_ids: request.filter?.programIds,
			functionId: request.filter?.functionId,
			type: request.filter?.type,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: WebviewWindow;

		console.log('Checking window');
		if (checkWindow('wallet-connect')) {
			for (const win of getAll()) {
				if (win.label === 'wallet-connect') {
					webview = win;
				}
			}
		} else {
			// Open the new window
	    	webview = new WebviewWindow('wallet-connect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			await webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			await webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(async () => {
			await webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = once(
				'get-records-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					await webview.destroy();
					storeSession(request_identifier);

					try {
						console.log('===================> INSIDE GETRECORDS');
						invoke<GetBackendRecordsResponse>('get_records', {
							request,
						})
							.then(response => {
								const res = convertGetRecordsResponse(response);
								resolve(formatJsonRpcResult(requestEvent.id, res));
							})
							.catch((error: AvailError) => {
								console.error(error);
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					} catch (error: any) {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.message));
					}
				},
			);

			const unlistenRejected = once(
				'get-records-rejected',
				async response => {
					const unlisten = await unlistenRejected;
					unlisten();
					await webview.destroy();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}
}
