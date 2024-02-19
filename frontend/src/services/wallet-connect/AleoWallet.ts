import {type Web3WalletTypes} from '@walletconnect/web3wallet';
import {type Window} from '@tauri-apps/api/window';
import {WebviewWindow, getAll, getCurrent} from '@tauri-apps/api/webview';
import {invoke} from '@tauri-apps/api/core';
import {
	formatJsonRpcResult,
	formatJsonRpcError,
	type JsonRpcResult,
	type JsonRpcError,
} from '@walletconnect/jsonrpc-utils';

import * as interfaces from './WCTypes';
import { AvailError } from '../../types/errors';
import { emit } from '@tauri-apps/api/event';

function checkWindow(reference: string) {
    let windows = getAll();
    let found = false;
    windows.forEach(win => {
        if (win.window.label == reference) {
            console.log("Found Label", win.label)
            found = true;
        }
    })
    return found;
}

//TODO - Switch to pairing topic or dapp name as key to sessionStorage entry
function getDappMetadata(session_topic: string) {
	const dapp_session_string = sessionStorage.getItem(session_topic);
	if (dapp_session_string !== null) {
		const dapp_session: interfaces.DappSession = JSON.parse(dapp_session_string) as interfaces.DappSession;
		return dapp_session;
	}
}

function storeSession(unique_request_id: string) {
	const expiry = new Date();
	expiry.setHours(expiry.getHours() + 1);

	sessionStorage.setItem(unique_request_id, expiry.toISOString());
}

function checkExpired(unique_request_id: string) {
	const expiry_string = sessionStorage.getItem(unique_request_id);
	if (expiry_string !== null) {
		const expiry = new Date(expiry_string);
		const now = new Date();
		const check = now > expiry;
		if (check) {
			sessionStorage.removeItem(unique_request_id);
		}

		return check;
	}

	return true;
}

export class AleoWallet {
    public_key?: string;

    constructor(public_key?: string) {
        this.public_key = public_key;
    }

    // retrurn the public key string
    getAddress() {
        return this.public_key;
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

    private async handleBalanceRequest(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {

        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.GetBalancesRequest;
        let request_identifier = "getBalance" + metadata?.name + request.assetId ;

        let asset_id = request.assetId;
        if (asset_id == "credits" || asset_id == undefined) {
            asset_id = "Aleo Credits";
        }

        if (!checkExpired(request_identifier)) {
            return new Promise((resolve, reject) => {
                invoke<interfaces.GetBalancesResponse>("get_balance", { request: request }).then((response) => {
                    resolve(formatJsonRpcResult(requestEvent.id, response));
                }).catch((error: AvailError) => {
                    console.error(error);
                    reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                });
            });
        } else {

            const wcRequest: interfaces.wcRequest = {
                method: "balance",
                question: metadata?.name + " wants to share your balance",
                image_ref: "../wc-images/balance.svg",
                approveResponse: "User approved the balance share.",
                rejectResponse: "User rejected the balance share.",
                dapp_img: metadata?.img,
                dapp_url: metadata?.url,
                asset_id: asset_id,
            }

            let webview: Window;

            if (checkWindow('walletConnect')) {

                getAll().forEach(win => {
                    if (win.label == 'walletConnect') {
                        webview = win.window;
                    }
                });
            } else {

                // Open the new window
                webview = new WebviewWindow('walletConnect', {
                    url: 'wallet-connect-screens/wallet-connect.html',
                    title: "Avail Wallet Connect",
                    width: 350,
                    height: 600,
                    resizable: false,
                });

                webview.once('tauri://created', async function () {
                    console.log('Window created');
                });

                webview.once('tauri://error', function (e) {
                    console.log('Window creation error');
                    console.error(e);
                    // Handle window creation error
                });
            }

            setTimeout(() => {
                webview.emit('wallet-connect-request', wcRequest);
                console.log("Emitting wallet-connect-request")
            }, 3000);

            return new Promise( async(resolve, reject) => {



                // Listen for the approval event from the secondary window
                const unlistenApproved = webview.once('balance-approved', async () => {
                    const unlisten = await unlistenApproved;
                    unlisten();
                    webview.close();
                    storeSession(request_identifier);

                    invoke<interfaces.GetBalancesResponse>("get_balance", { request: request }).then((response) => {
                        resolve(formatJsonRpcResult(requestEvent.id, response));
                    }).catch((error: AvailError) => {
                        console.error(error);
                        reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                    });
                });

                // Listen for the rejection event from the secondary window
                const unlistenRejected = webview.once('balance-rejected', async (response) => {
                    const unlisten = await unlistenRejected;
                unlisten();
                    console.log('Balance share was rejected', response);
                    webview.close();
                    reject(formatJsonRpcError(requestEvent.id, "User rejected balance share"));
                });
            });
        }
    }

    private async handleAccountRequest(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {

        try {

            let aleoAddress: string = this.getAddress() as string;
            let response: interfaces.GetSelectedAccountResponse = {
                account: {
                    network: "aleo",
                    chainId: "1",
                    address: aleoAddress,
                    shortenedAddress: interfaces.shortenAddress(aleoAddress)
                }
            }

            return formatJsonRpcResult(requestEvent.id, response)

        } catch (error: any) {
            console.error(error)
            return formatJsonRpcError(requestEvent.id, error.message)
        }
    }

    private async handleDecrypt(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.DecryptRequest

        let request_identifier = "decrypt" + metadata?.name ;

        if (!checkExpired(request_identifier)) {
            return new Promise((resolve, reject) => {
                invoke<interfaces.DecryptResponse>("decrypt_records", { request: request }).then((response) => {
                    resolve(formatJsonRpcResult(requestEvent.id, response));
                }).catch((error: AvailError) => {
                    console.error(error);
                    reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                });
            });
        } else {
            const wcRequest: interfaces.wcRequest = {
                method: "decrypt",
                question: metadata?.name + " wants you to decrypt and share these records",
                image_ref: "../wc-images/decrypt.svg",
                approveResponse: "User approved decryption.",
                rejectResponse: "User rejected decryption.",
                dapp_img: metadata?.img,
                dapp_url: metadata?.url,
                ciphertexts: request.ciphertexts,
            }

            let webview: Window;

            if (checkWindow('walletConnect')) {

                getAll().forEach(win => {
                    if (win.label == 'walletConnect') {
                        webview = win.window;
                    }
                });
            } else {

                // Open the new window
                webview = new WebviewWindow('walletConnect', {
                    url: 'wallet-connect-screens/wallet-connect.html',
                    title: "Avail Wallet Connect",
                    width: 350,
                    height: 600,
                    resizable: false,
                });




                webview.once('tauri://created', async function () {
                    console.log('Window created');
                });

                webview.once('tauri://error', function (e) {
                    console.log('Window creation error');
                    console.error(e);
                    // Handle window creation error
                });
            }

            setTimeout(() => {
                webview.emit('wallet-connect-request', wcRequest);
            }, 3000);

            return new Promise( async(resolve, reject) => {
                const unlistenApproved = webview.once('decrypt-approved', async (response) => {
                    const unlisten = await unlistenApproved;
                unlisten();
                    webview.close();
                    storeSession(request_identifier);

                    try {

                        invoke<interfaces.DecryptResponse>("decrypt_records", { request: request }).then((response) => {
                            resolve(formatJsonRpcResult(requestEvent.id, response));
                        }).catch((error: AvailError) => {
                            console.error(error);
                            reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                        });

                    } catch (error: any) {
                        console.error(error)
                        reject(formatJsonRpcError(requestEvent.id, error.message))
                    }
                });

                // Listen for the rejection event from the secondary window
                const unlistenRejected = webview.once('decrypt-rejected', async (response) => {
                    const unlisten = await unlistenRejected;
                unlisten();
                    console.log(response);
                    webview.close();
                    reject(formatJsonRpcResult(requestEvent.id, response));
                });
            });
        }

    }

    private async handleSign(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.SignatureRequest

        const wcRequest: interfaces.wcRequest = {
            method: "sign",
            question: metadata?.name + " wants you to sign this message",
            image_ref: "../wc-images/sign.svg",
            approveResponse: "User approved signature.",
            rejectResponse: "User rejected signature.",
            message: request.message,
            dapp_img: metadata?.img,
            dapp_url: metadata?.url,
        }

        let webview: Window;

        if (checkWindow('walletConnect')) {

            getAll().forEach(win => {
                if (win.label == 'walletConnect') {
                    webview = win.window;
                }
            });
        } else {

            // Open the new window
            webview = new WebviewWindow('walletConnect', {
                url: 'wallet-connect-screens/wallet-connect.html',
                title: "Avail Wallet Connect",
                width: 350,
                height: 600,
                resizable: false,
            });




            webview.once('tauri://created', async function () {
                console.log('Window created');
            });

            webview.once('tauri://error', function (e) {
                console.log('Window creation error');
                //TODO - Handle window creation error
            });
        }

        setTimeout(() => {
            webview.emit('wallet-connect-request', wcRequest);
        }, 3000);

        return new Promise( async(resolve, reject) => {
            const unlistenApproved = webview.once('sign-approved', async (response) => {
                const unlisten = await unlistenApproved;
                unlisten();
                webview.close();
                try {

                    invoke<interfaces.SignatureResponse>("sign", { request: request }).then((response) => {
                        resolve(formatJsonRpcResult(requestEvent.id, response));
                    }).catch((error: AvailError) => {
                        reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                    });

                } catch (error: any) {
                    reject(formatJsonRpcError(requestEvent.id, error.message))
                }
            });

            // Listen for the rejection event from the secondary window
            const unlistenRejected = webview.once('sign-rejected', async (response) => {
                const unlisten = await unlistenRejected;
                unlisten();
                console.log(response);
                webview.close();
                reject(formatJsonRpcResult(requestEvent.id, response));
            });
        });

    }

    // This function handles both execution and deployments dependant on EventType
    private async handleCreateRequestEvent(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.CreateEventRequest
        console.log("===========> Request full", request);
        // TODO - User fee privacy choice
        let wcRequest: interfaces.wcRequest;
        if (request.type == interfaces.EventType.Deploy) {
            wcRequest = {
                method: "create-request-event",
                question: metadata?.name + " wants to deploy a program",
                image_ref: "../wc-images/deploy.svg",
                approveResponse: "User approved deployment event.",
                rejectResponse: "User rejected deployment event.",
                fee: request.fee.toString(),
                program_id: request.programId,
                dapp_img: metadata?.img,
                dapp_url: metadata?.url,
            }
        } else {
            wcRequest = {
                method: "create-request-event",
                question: metadata?.name + " wants to execute a program",
                image_ref: "../wc-images/execute.svg",
                approveResponse: "User approved create request event.",
                rejectResponse: "User rejected create request event.",
                fee: request.fee.toString(),
                program_id: request.programId,
                function_id: request.functionId,
                inputs: request.inputs,
                dapp_img: metadata?.img,
                dapp_url: metadata?.url,
            }
        }

        let webview: Window;

        if (checkWindow('walletConnect')) {

            getAll().forEach(win => {
                if (win.window.label == 'walletConnect') {
                    webview = win.window;
                    webview.destroy();
                }
            });

            return formatJsonRpcError(requestEvent.id, "ERROR OPENING WINDOW")

        } else {

            // Open the new window
            webview = new WebviewWindow('walletConnect', {
                url: 'wallet-connect-screens/wallet-connect.html',
                title: "Avail Wallet Connect",
                width: 350,
                height: 600,
                resizable: false,
            });


            webview.once('tauri://created', async function () {
                console.log('Window created');
            });

            webview.once('tauri://error', function (e) {
                console.error(e);
                if (e){
                    webview.destroy();
                    return formatJsonRpcError(requestEvent.id, "ERROR CREATING WINDOW");
                }
            });

        setTimeout(async() => {
           await webview.emit('wallet-connect-request', wcRequest);
        }, 2700);

        let stopper = true;
        return new Promise(async (resolve, reject) => {
          await webview.once('create-request-event-approved', async (response) => {
                webview.destroy();
                if(stopper){
                stopper = false;
                sessionStorage.setItem("transfer_on", "true");

                let payload_obj = JSON.stringify(response.payload);
                let fee_op = JSON.parse(payload_obj).feeOption;

                console.log("--EXECUTION CALLED--")

                try {
                    console.log(request);
                    invoke<interfaces.CreateEventResponse>("request_create_event", { request: request, fee_private: fee_op }).then((response) => {
                        sessionStorage.setItem("transfer_on", "false");
                        resolve(formatJsonRpcResult(requestEvent.id, response));

                    }).catch((error: AvailError) => {
                        sessionStorage.setItem("transfer_on", "false");
                        reject(formatJsonRpcError(requestEvent.id, error.external_msg));

                    });

                } catch (error: any) {
                    sessionStorage.setItem("transfer_on", "false");
                    reject(formatJsonRpcError(requestEvent.id, error.message))
                }}
            });


            await webview.once('create-request-event-rejected', async (response) => {
                webview.destroy();
                reject(formatJsonRpcResult(requestEvent.id, response));
            });

        });
    }

    }

    private async handleGetEvent(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.GetEventRequest

        let request_identifier = "getEvent" + metadata?.name + request.id ;

        if (!checkExpired(request_identifier)) {
            return new Promise((resolve, reject) => {
                invoke<interfaces.GetEventResponse>("get_event", { request: request }).then((response) => {
                    resolve(formatJsonRpcResult(requestEvent.id, response));
                }).catch((error: AvailError) => {
                    console.error(error);
                    reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                });
            });
        } else {

            const wcRequest: interfaces.wcRequest = {
                method: "get-event",
                question: metadata?.name + " wants to share this event",
                image_ref: "../wc-images/tx.svg",
                approveResponse: "User approved get event.",
                rejectResponse: "User rejected get event.",
                dapp_img: metadata?.img,
                dapp_url: metadata?.url,
            }

            let webview: Window;

            if (checkWindow('walletConnect')) {

                getAll().forEach(win => {
                    if (win.label == 'walletConnect') {
                        webview = win.window;
                    }
                });
            } else {

                // Open the new window
                webview = new WebviewWindow('walletConnect', {
                    url: 'wallet-connect-screens/wallet-connect.html',
                    title: "Avail Wallet Connect",
                    width: 350,
                    height: 600,
                    resizable: false,
                });

                webview.once('tauri://created', async function () {
                    console.log('Window created');
                }

                );

                webview.once('tauri://error', function (e) {
                    console.log('Window creation error');
                    console.error(e);
                    // Handle window creation error
                });

            }

            setTimeout(() => {
                webview.emit('wallet-connect-request', wcRequest);
                console.log("Emitting wallet-connect-request")
            }, 3000);

            return new Promise( async(resolve, reject) => {
                const unlistenApproved = webview.once('get-event-approved', async (response) => {
                    const unlisten = await unlistenApproved;
                unlisten();
                    webview.close();
                    storeSession(request_identifier);

                    try {

                        invoke<interfaces.GetEventResponse>("get_event", { request: request }).then((response) => {
                            resolve(formatJsonRpcResult(requestEvent.id, response));
                        }).catch((error: AvailError) => {
                            console.error(error);
                            reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                        });

                    } catch (error: any) {
                        console.error(error)
                        reject(formatJsonRpcError(requestEvent.id, error.message))
                    }
                });


                const unlistenRejected = webview.once('get-event-rejected', async (response) => {
                    const unlisten = await unlistenRejected;
                unlisten();
                    webview.close();
                    reject(formatJsonRpcResult(requestEvent.id, response));
                });
            });
        }
    }

    private async handleGetEvents(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.GetEventsRequest

        let request_identifier = "getEvents" + metadata?.name+request.filter?.functionId+ request.filter?.programId ;

        if (!checkExpired(request_identifier)) {
            return new Promise((resolve, reject) => {
                invoke<interfaces.GetEventsResponse>("get_events", { request: request }).then((response) => {
                    resolve(formatJsonRpcResult(requestEvent.id, response));
                }).catch((error: AvailError) => {
                    console.error(error);
                    reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                });
            });
        }else{

        const wcRequest: interfaces.wcRequest = {
            method: "get-events",
            question: metadata?.name + " wants you to share your transaction history",
            image_ref: "../wc-images/transactions.svg",
            approveResponse: "User approved get events.",
            rejectResponse: "User rejected get events.",
            program_id: request.filter?.programId,
            function_id: request.filter?.functionId,
            type: request.filter?.type,
            dapp_img : metadata?.img,
            dapp_url : metadata?.url,
        }

        let webview: Window;

        if (checkWindow('walletConnect')) {

            getAll().forEach(win => {
                if (win.label == 'walletConnect') {
                    webview = win.window;
                }
            });
        } else {

            // Open the new window
            webview = new WebviewWindow('walletConnect', {
                url: 'wallet-connect-screens/wallet-connect.html',
                title: "Avail Wallet Connect",
                width: 350,
                height: 600,
                resizable: false,
            });

            webview.once('tauri://created', async function () {
                console.log('Window created');
            }

            );

            webview.once('tauri://error', function (e) {
                console.log('Window creation error');
                console.error(e);
                // Handle window creation error
            });

        }

        setTimeout(() => {
            webview.emit('wallet-connect-request', wcRequest);
            console.log("Emitting wallet-connect-request")
        }, 3000);

        return new Promise( async(resolve, reject) => {
            const unlistenApproved = webview.once('get-events-approved', async (response) => {
                const unlisten = await unlistenApproved;
                unlisten();
                webview.close();
                storeSession(request_identifier);

                try {
                    invoke<interfaces.GetEventsResponse>("get_events", { request: request }).then((response) => {
                        resolve(formatJsonRpcResult(requestEvent.id, response));
                    }).catch((error: AvailError) => {
                        console.error(error);
                        reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                    });

                } catch (error: any) {
                    console.error(error)
                    reject(formatJsonRpcError(requestEvent.id, error.message))
                }
            })

            const unlistenRejected = webview.once('get-events-rejected', async (response) => {
                const unlisten = await unlistenRejected;
                unlisten();
                webview.close();
                reject(formatJsonRpcResult(requestEvent.id, response));
            });
        });
        }
    }

    private async handleGetRecords(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {
        let metadata = getDappMetadata(requestEvent.topic);
        let request = requestEvent.params.request.params as interfaces.GetRecordsRequest

        let request_identifier = "getRecords" + metadata?.name + request.filter?.functionId + request.filter?.programIds ;
        if (request){
            if(request.filter){
                if (request.filter.programIds === undefined){
                    request.filter.programIds = [];
                }
            }
        }
        console.log("p---------->rogramid", request.filter?.programIds);
        if (!checkExpired(request_identifier)) {
            return new Promise((resolve, reject) => {
                invoke<interfaces.GetBackendRecordsResponse>("get_records", { request: request }).then((response) => {
                    let res = interfaces.convertGetRecordsResponse(response);
                    resolve(formatJsonRpcResult(requestEvent.id, res));
                }).catch((error: AvailError) => {
                    console.error(error);
                    reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                });
            });
        }else{
        const wcRequest: interfaces.wcRequest = {
            method: "get-records",
            question: metadata?.name + " wants you to share your records",
            image_ref: "../wc-images/transactions.svg",
            approveResponse: "User approved get records.",
            rejectResponse: "User rejected get records.",
            program_ids: request.filter?.programIds,
            function_id: request.filter?.functionId,
            type: request.filter?.type,
            dapp_img: metadata?.img,
            dapp_url: metadata?.url,
        }

        let webview: Window;

        if (checkWindow('walletConnect')) {

            getAll().forEach(win => {
                if (win.label == 'walletConnect') {
                    webview = win.window;
                }
            });
        } else {

            // Open the new window
            webview = new WebviewWindow('walletConnect', {
                url: 'wallet-connect-screens/wallet-connect.html',
                title: "Avail Wallet Connect",
                width: 350,
                height: 600,
                resizable: false,
            });

            webview.once('tauri://created', async function () {
                console.log('Window created');
            }

            );

            webview.once('tauri://error', function (e) {
                console.log('Window creation error');
                console.error(e);
                // Handle window creation error
            });

        }

        setTimeout(() => {
            webview.emit('wallet-connect-request', wcRequest);
            console.log("Emitting wallet-connect-request")
        }, 3000);

        return new Promise( async(resolve, reject) => {
            const unlistenApproved = webview.once('get-records-approved', async (response) => {
                const unlisten = await unlistenApproved;
                unlisten();
                webview.close();
                storeSession(request_identifier);

                try {
                    console.log("===================> INSIDE GETRECORDS");
                    invoke<interfaces.GetBackendRecordsResponse>("get_records", { request: request }).then((response) => {
                        let res = interfaces.convertGetRecordsResponse(response);
                        resolve(formatJsonRpcResult(requestEvent.id, res));
                    }).catch((error: AvailError) => {
                        console.error(error);
                        reject(formatJsonRpcError(requestEvent.id, error.external_msg));
                    });

                } catch (error: any) {
                    console.error(error)
                    reject(formatJsonRpcError(requestEvent.id, error.message))
                }
            })

            const unlistenRejected = webview.once('get-records-rejected', async (response) => {
                const unlisten = await unlistenRejected;
                unlisten();
                webview.close();
                reject(formatJsonRpcResult(requestEvent.id, response));
            });
        });
    }
}


    // Handles any method calls from the DApp
    async invokeMethod(requestEvent: Web3WalletTypes.SessionRequest): Promise<JsonRpcResult | JsonRpcError> {

        const request_method = requestEvent.params.request.method;

        switch (request_method) {
            case interfaces.ALEO_METHODS.ALEO_GETBALANCE:
                return await this.handleBalanceRequest(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_GETACCOUNT:
                return await this.handleAccountRequest(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_DECRYPT:
                return await this.handleDecrypt(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_SIGN:
                return await this.handleSign(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_CREATE_EVENT:
                return await this.handleCreateRequestEvent(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_GET_EVENT:
                return await this.handleGetEvent(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_GET_EVENTS:
                return await this.handleGetEvents(requestEvent)

            case interfaces.ALEO_METHODS.ALEO_GET_RECORDS:
                return await this.handleGetRecords(requestEvent)
        }

        console.log(`Method unsupported ${request_method}`)
        return formatJsonRpcError(requestEvent.id, `Method unsupported ${request_method}`);
    }

}
