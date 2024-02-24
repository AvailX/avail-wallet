import {invoke} from '@tauri-apps/api/core';
import {getAll, WebviewWindow} from '@tauri-apps/api/webviewWindow';
import {type WindowOptions, type Window} from '@tauri-apps/api/window';
import {
	formatJsonRpcError,
	formatJsonRpcResult,
	type JsonRpcError,
	type JsonRpcResult,
} from '@walletconnect/jsonrpc-utils';
import {type Web3WalletTypes} from '@walletconnect/web3wallet';
import {type AvailError} from '../../types/errors';
import {listen, once} from '@tauri-apps/api/event';
import * as interfaces from './WCTypes';
import {type WebviewOptions} from '@tauri-apps/api/webview';

function checkWindow(reference: string) {
	return getAll().filter(win => win.label === reference).length > 0;
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
function getWindowOrCreate(windowLabel: string, options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions): WebviewWindow {
	const window = getWindow(windowLabel);
	if (window) {
		return window;
	}

	return new WebviewWindow(windowLabel, options);
}

// TODO - Switch to pairing topic or dapp name as key to sessionStorage entry
function getDappMetadata(session_topic: string) {
	const dappSessionString = sessionStorage.getItem(session_topic);
	return dappSessionString ? JSON.parse(dappSessionString) as interfaces.DappSession : null;
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

export class AleoWallet {
	publicKey?: string;

	constructor(public_key?: string) {
		this.publicKey = public_key;
	}

	getAddress() {
		return this.publicKey;
	}

	chainName() {
		return interfaces.ALEO_CHAIN;
	}

	chainMethods() {
		return Object.values(interfaces.ALEO_METHODS);
	}

	chainEvent() {
		return interfaces.ALEO_EVENTS;
	}

	private async handleBalanceRequest(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as interfaces.GetBalancesRequest;

		const requestIdentifier = 'getBalance' + (metadata?.name ?? '') + request.assetId;

		let {assetId} = request;
		if (assetId === 'credits' || assetId === undefined) {
			assetId = 'Aleo Credits';
		}

		if (!checkExpired(requestIdentifier)) {
			return new Promise((resolve, reject) => {
				invoke<interfaces.GetBalancesResponse>('get_balance', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(new Error(formatJsonRpcError(requestEvent.id, error.external_msg).error.data));
					});
			});
		}

		const wcRequest: interfaces.wcRequest = {
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

		const webview = getWindowOrCreate('walletConnect', {
			url: 'wallet-connect-screens/wallet-connect.html',
			title: 'Avail Wallet Connect',
			width: 390,
			height: 680,
			resizable: false,
		});

		setTimeout(async () => {
			await webview.window.emit('wallet-connect-request', wcRequest);
		}, 3000);

		return new Promise((resolve, reject) => {
			// Listen for the approval event from the secondary window
			const unlistenApproved = once('balance-approved', async () => {
				(await unlistenApproved)();
				await webview.window.destroy();
				storeSession(requestIdentifier);

				invoke<interfaces.GetBalancesResponse>('get_balance', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(new Error(formatJsonRpcError(requestEvent.id, error.external_msg).error.data));
					});
			});

			// Listen for the rejection event from the secondary window
			const unlistenRejected = once(
				'balance-rejected',
				async response => {
					(await unlistenRejected)();
					await webview.window.destroy();
					reject(
						new Error(formatJsonRpcError(requestEvent.id, 'User rejected balance share').error.data),
					);
				},
			);
		});
	}

	private async handleAccountRequest(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		try {
			const aleoAddress: string = this.getAddress()!;
			const response: interfaces.GetSelectedAccountResponse = {
				account: {
					network: 'aleo',
					chainId: '1',
					address: aleoAddress,
					shortenedAddress: interfaces.shortenAddress(aleoAddress),
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
		const request = requestEvent.params.request
			.params as interfaces.DecryptRequest;

		const request_identifier = 'decrypt' + metadata?.name;

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<interfaces.DecryptResponse>('decrypt_records', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: interfaces.wcRequest = {
			method: 'decrypt',
			question:
        metadata?.name + ' wants you to decrypt and share these records',
			imageRef: '../wc-images/decrypt.svg',
			approveResponse: 'User approved decryption.',
			rejectResponse: 'User rejected decryption.',
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
			ciphertexts: request.ciphertexts,
		};

		let webview: Window;

		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label === 'walletConnect') {
					webview = win.window;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('walletConnect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(() => {
			webview.emit('wallet-connect-request', wcRequest);
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = webview.once(
				'decrypt-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					webview.close();
					storeSession(request_identifier);

					try {
						invoke<interfaces.DecryptResponse>('decrypt_records', {request})
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

			// Listen for the rejection event from the secondary window
			const unlistenRejected = webview.once(
				'decrypt-rejected',
				async response => {
					const unlisten = await unlistenRejected;

					unlisten();
					console.log(response);
					webview.close();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}

	private async handleSign(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as interfaces.SignatureRequest;

		const wcRequest: interfaces.wcRequest = {
			method: 'sign',
			question: metadata?.name + ' wants you to sign this message',
			imageRef: '../wc-images/sign.svg',
			approveResponse: 'User approved signature.',
			rejectResponse: 'User rejected signature.',
			message: request.message,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: Window;

		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label == 'walletConnect') {
					webview = win.window;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('walletConnect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			webview.once('tauri://error', e => {
				console.log('Window creation error');
				// TODO - Handle window creation error
			});
		}

		setTimeout(() => {
			webview.emit('wallet-connect-request', wcRequest);
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = webview.once(
				'sign-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					webview.close();
					try {
						invoke<interfaces.SignatureResponse>('sign', {request})
							.then(response => {
								resolve(formatJsonRpcResult(requestEvent.id, response));
							})
							.catch((error: AvailError) => {
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					} catch (error: any) {
						reject(formatJsonRpcError(requestEvent.id, error.message));
					}
				},
			);

			// Listen for the rejection event from the secondary window
			const unlistenRejected = webview.once(
				'sign-rejected',
				async response => {
					const unlisten = await unlistenRejected;
					unlisten();
					console.log(response);
					webview.close();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}

	// This function handles both execution and deployments dependant on EventType
	private async handleCreateRequestEvent(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as interfaces.CreateEventRequest;
		console.log('===========> Request full', request);
		// TODO - User fee privacy choice
		let wcRequest: interfaces.wcRequest;
		if (request.type == interfaces.EventType.Deploy) {
			wcRequest = {
				method: 'create-request-event',
				question: metadata?.name + ' wants to deploy a program',
				imageRef: '../wc-images/deploy.svg',
				approveResponse: 'User approved deployment event.',
				rejectResponse: 'User rejected deployment event.',
				fee: request.fee.dapp_url(),
				program_id: request.programId,
				dappImage: metadata?.img,
				dappUrl: metadata?.url,
			};
		} else {
			wcRequest = {
				method: 'create-request-event',
				question: metadata?.name + ' wants to execute a program',
				imageRef: '../wc-images/execute.svg',
				approveResponse: 'User approved create request event.',
				rejectResponse: 'User rejected create request event.',
				fee: request.fee.dapp_url(),
				program_id: request.programId,
				function_id: request.functionId,
				inputs: request.inputs,
				dappImage: metadata?.img,
				dappUrl: metadata?.url,
			};
		}

		let webview: Window;

		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label == 'walletConnect') {
					webview = win.window;
					webview.destroy();
				}
			}

			return formatJsonRpcError(requestEvent.id, 'ERROR OPENING WINDOW');
		}

		// Open the new window
		webview = new WebviewWindow('walletConnect', {
			url: 'wallet-connect-screens/wallet-connect.html',
			title: 'Avail Wallet Connect',
			width: 390,
			height: 680,
			resizable: false,
		});

		webview.once('tauri://created', async () => {
			console.log('Window created');
		});

		webview.once('tauri://error', e => {
			console.error(e);
			if (e) {
				webview.destroy();
				return formatJsonRpcError(requestEvent.id, 'ERROR CREATING WINDOW');
			}
		});

		setTimeout(async () => {
			await webview.emit('wallet-connect-request', wcRequest);
		}, 2700);

		let stopper = true;
		return new Promise(async (resolve, reject) => {
			await webview.once('create-request-event-approved', async response => {
				webview.destroy();
				if (stopper) {
					stopper = false;
					sessionStorage.setItem('transfer_on', 'true');

					const payload_object = JSON.stringify(response.payload);
					const fee_op = JSON.parse(payload_object).feeOption;

					console.log('--EXECUTION CALLED--');

					try {
						console.log(request);
						invoke<interfaces.CreateEventResponse>('request_create_event', {
							request,
							fee_private: fee_op,
						})
							.then(response => {
								sessionStorage.setItem('transfer_on', 'false');
								resolve(formatJsonRpcResult(requestEvent.id, response));
							})
							.catch((error: AvailError) => {
								sessionStorage.setItem('transfer_on', 'false');
								reject(formatJsonRpcError(requestEvent.id, error.external_msg));
							});
					} catch (error: any) {
						sessionStorage.setItem('transfer_on', 'false');
						reject(formatJsonRpcError(requestEvent.id, error.message));
					}
				}
			});

			await webview.once('create-request-event-rejected', async response => {
				webview.destroy();
				reject(formatJsonRpcResult(requestEvent.id, response));
			});
		});
	}

	private async handleGetEvent(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const metadata = getDappMetadata(requestEvent.topic);
		const request = requestEvent.params.request
			.params as interfaces.GetEventRequest;

		const request_identifier = 'getEvent' + metadata?.name + request.id;

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<interfaces.GetEventResponse>('get_event', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: interfaces.wcRequest = {
			method: 'get-event',
			question: metadata?.name + ' wants to share this event',
			imageRef: '../wc-images/tx.svg',
			approveResponse: 'User approved get event.',
			rejectResponse: 'User rejected get event.',
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: Window;

		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label == 'walletConnect') {
					webview = win.window;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('walletConnect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(() => {
			webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = webview.once(
				'get-event-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					webview.close();
					storeSession(request_identifier);

					try {
						invoke<interfaces.GetEventResponse>('get_event', {request})
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

			const unlistenRejected = webview.once(
				'get-event-rejected',
				async response => {
					const unlisten = await unlistenRejected;

					unlisten();
					webview.close();
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
			.params as interfaces.GetEventsRequest;

		const request_identifier
      = 'getEvents'
      + metadata?.name
      + request.filter?.functionId
      + request.filter?.programId;

		if (!checkExpired(request_identifier)) {
			return new Promise((resolve, reject) => {
				invoke<interfaces.GetEventsResponse>('get_events', {request})
					.then(response => {
						resolve(formatJsonRpcResult(requestEvent.id, response));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: interfaces.wcRequest = {
			method: 'get-events',
			question: metadata?.name + ' wants you to share your transaction history',
			imageRef: '../wc-images/transactions.svg',
			approveResponse: 'User approved get events.',
			rejectResponse: 'User rejected get events.',
			program_id: request.filter?.programId,
			function_id: request.filter?.functionId,
			type: request.filter?.type,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: Window;

		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label == 'walletConnect') {
					webview = win.window;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('walletConnect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(() => {
			webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = webview.once(
				'get-events-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					webview.close();
					storeSession(request_identifier);

					try {
						invoke<interfaces.GetEventsResponse>('get_events', {request})
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

			const unlistenRejected = webview.once(
				'get-events-rejected',
				async response => {
					const unlisten = await unlistenRejected;
					unlisten();
					webview.close();
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
			.params as interfaces.GetRecordsRequest;

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
				invoke<interfaces.GetBackendRecordsResponse>('get_records', {request})
					.then(response => {
						const res = interfaces.convertGetRecordsResponse(response);
						resolve(formatJsonRpcResult(requestEvent.id, res));
					})
					.catch((error: AvailError) => {
						console.error(error);
						reject(formatJsonRpcError(requestEvent.id, error.external_msg));
					});
			});
		}

		const wcRequest: interfaces.wcRequest = {
			method: 'get-records',
			question: metadata?.name + ' wants you to share your records',
			imageRef: '../wc-images/transactions.svg',
			approveResponse: 'User approved get records.',
			rejectResponse: 'User rejected get records.',
			program_ids: request.filter?.programIds,
			function_id: request.filter?.functionId,
			type: request.filter?.type,
			dappImage: metadata?.img,
			dappUrl: metadata?.url,
		};

		let webview: Window;

		console.log('Checking window');
		if (checkWindow('walletConnect')) {
			for (const win of getAll()) {
				if (win.label == 'walletConnect') {
					webview = win.window;
				}
			}
		} else {
			// Open the new window
			webview = new WebviewWindow('walletConnect', {
				url: 'wallet-connect-screens/wallet-connect.html',
				title: 'Avail Wallet Connect',
				width: 390,
				height: 680,
				resizable: false,
			});

			webview.once('tauri://created', async () => {
				console.log('Window created');
			});

			webview.once('tauri://error', e => {
				console.log('Window creation error');
				console.error(e);
				// Handle window creation error
			});
		}

		setTimeout(() => {
			webview.emit('wallet-connect-request', wcRequest);
			console.log('Emitting wallet-connect-request');
		}, 3000);

		return new Promise(async (resolve, reject) => {
			const unlistenApproved = webview.once(
				'get-records-approved',
				async response => {
					const unlisten = await unlistenApproved;
					unlisten();
					webview.close();
					storeSession(request_identifier);

					try {
						console.log('===================> INSIDE GETRECORDS');
						invoke<interfaces.GetBackendRecordsResponse>('get_records', {
							request,
						})
							.then(response => {
								const res = interfaces.convertGetRecordsResponse(response);
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

			const unlistenRejected = webview.once(
				'get-records-rejected',
				async response => {
					const unlisten = await unlistenRejected;
					unlisten();
					webview.close();
					reject(formatJsonRpcResult(requestEvent.id, response));
				},
			);
		});
	}

	// Handles any method calls from the DApp
	async invokeMethod(
		requestEvent: Web3WalletTypes.SessionRequest,
	): Promise<JsonRpcResult | JsonRpcError> {
		const request_method = requestEvent.params.request.method;

		switch (request_method) {
			case interfaces.ALEO_METHODS.ALEO_GETBALANCE: {
				return this.handleBalanceRequest(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_GETACCOUNT: {
				return this.handleAccountRequest(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_DECRYPT: {
				return this.handleDecrypt(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_SIGN: {
				return this.handleSign(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_CREATE_EVENT: {
				return this.handleCreateRequestEvent(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_GET_EVENT: {
				return this.handleGetEvent(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_GET_EVENTS: {
				return this.handleGetEvents(requestEvent);
			}

			case interfaces.ALEO_METHODS.ALEO_GET_RECORDS: {
				return this.handleGetRecords(requestEvent);
			}
		}

		console.log(`Method unsupported ${request_method}`);
		return formatJsonRpcError(
			requestEvent.id,
			`Method unsupported ${request_method}`,
		);
	}
}
