

import { Core } from '@walletconnect/core'
import { Verify, SignClientTypes } from '@walletconnect/types'
import { Web3Wallet, IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { JsonRpcResult, JsonRpcError, formatJsonRpcError } from '@walletconnect/jsonrpc-utils'

import { AleoWallet } from './AleoWallet'

import { SessionInfo } from './SessionInfo'

import { WebviewWindow } from '@tauri-apps/api/webview'
import { emit } from '@tauri-apps/api/event'

import { DappSession, wcRequest } from './WCTypes'

import { get_address } from '../storage/persistent'


type PingEventData = Omit<SignClientTypes.BaseEventArgs<unknown>, "params">;

export class WalletConnectManager {
    theWallet?: IWeb3Wallet;
    projectID: string;
    relayerURL: string;
    aleo_wallet?: AleoWallet;
    clientId?: string;

    currentRequestVerifyContext?: Verify.Context;
    pairingTopic?: string;
    sessionTopic?: string;


    constructor() {
        this.projectID = "9d41eeacbfa8659cce91de12a8bf1806";
        this.relayerURL = "wss://relay.walletconnect.com";
        this.onSessionProposal = this.onSessionProposal.bind(this);
        this.onSessionDelete = this.onSessionDelete.bind(this);
        this.onSessionRequest = this.onSessionRequest.bind(this);
        //this.onAuthRequest = this.onAuthRequest.bind(this);
        this.onSignClientPing = this.onSignClientPing.bind(this);

    }

    async setup() {

        const address = await get_address();
        const wallet = new AleoWallet(address);
        this.aleo_wallet = wallet;


        const core = new Core({
            projectId: this.projectID,
            relayUrl: this.relayerURL,
        })

        this.theWallet = await Web3Wallet.init({
            core,
            metadata: {
                name: 'Avail',
                description: 'Frictionless control of your money and data privately on Aleo.',
                url: 'avail.global',
                icons: []
            }
        })

        try {
            this.clientId = await this.theWallet.engine.signClient.core.crypto.getClientId()
            console.log('WalletConnect ClientID: ', this.clientId)
        } catch (error) {
            console.error('Failed to set WalletConnect clientId', error)
        }

        this.theWallet.on('session_proposal', this.onSessionProposal)
        this.theWallet.on('session_request', this.onSessionRequest)
        // this.theWallet.on('auth_request', this.onAuthRequest);
        this.theWallet.engine.signClient.events.on('session_ping', this.onSignClientPing)
        this.theWallet.on('session_delete', this.onSessionDelete)
    }

    // dApp sent us a session proposal
    //  id - is the dApp id submitting the proposal
    //  params - includes details of what the dApp is expecting.
    private async onSessionProposal(proposal: Web3WalletTypes.SessionProposal) {

        console.log()
        console.log()
        console.log("  ============================== ")
        console.log("  >>> session_proposal event >>>")
        console.log()

        try {
            if (!this.theWallet || !this.aleo_wallet) {
                console.log("Wallet is null! Call setup()");
                return;
            }

            if (!proposal) {
                console.log("Missing proposal data.");
                return;
            }

            console.log("proposal", proposal)
            //TODO - Proposal.metadata is not being used it has data about the app we can display
            // metadata: { description: "example dapp", url: "",name:"",icons:["data:image/png;base64,...."] }
            const metadata= proposal.params.proposer.metadata;

            {/* Approve/Reject Connection window -- START*/ }
            // Open the new window
            const webview = new WebviewWindow('walletConnect', {
                url: 'wallet-connect-screens/wallet-connect.html',
                title: "Avail Wallet Connect",
                width: 350,
                height: 600,
                resizable: false,
            });

            const wcRequest: wcRequest = {
                method: "connect",
                question: "Do you want to connect to "+metadata.name+" ?",
                image_ref: "../wc-images/connect.svg",
                approveResponse: "User approved wallet connect",
                rejectResponse: "User rejected wallet connect",
                description: metadata.description,
                dapp_url: metadata.url,
                dapp_img: metadata.icons[0]
            }

            webview.once('tauri://created', function () {
                console.log('Window created');

                setTimeout(() => {
                    emit('wallet-connect-request', wcRequest);
                    console.log("Emitting wallet-connect-request")
                }, 3000);


            });

            webview.once('tauri://error', function (e) {
                console.log('Window creation error');
                console.error(e);
                // Handle window creation error
            });

            let aleo_wallet = this.aleo_wallet;
            let theWallet = this.theWallet;

            await webview.once('connect-approved', async (response) => {
                console.log('Wallet connect was approved', response);
                webview.close();

                SessionInfo.show(proposal, [aleo_wallet.chainName()])

            const supportedNamespaces = {
                // What the dApp requested...
                proposal: proposal.params,

                // What we support...
                supportedNamespaces: {
                    aleo: {
                        chains: [aleo_wallet.chainName()],
                        methods: aleo_wallet.chainMethods(),
                        events: aleo_wallet.chainEvent(),
                        accounts: [`${aleo_wallet.chainName()}:${aleo_wallet.getAddress()}`]
                    }
                }
            };
            console.log('supportedNamespaces', supportedNamespaces)
            const approvedNamespaces = buildApprovedNamespaces(supportedNamespaces)

            console.log("Approving session...")
            const session = await theWallet.approveSession({
                id: proposal.id,
                relayProtocol: proposal.params.relays[0].protocol,
                namespaces: approvedNamespaces
            })
            console.log("Approved session", session)
            emit('connected', session)

            this.currentRequestVerifyContext = proposal.verifyContext;

            // This value is present in the pairing URI
            // wc:<pairingTopic>@....
            this.pairingTopic = proposal.params.pairingTopic;

            // This value will stick throughout the session and will
            // be present in session_request, session_delete events
            this.sessionTopic = session.topic
            console.log("Session topic", this.sessionTopic)
            const dapp_session  = DappSession(metadata.name,metadata.description, metadata.url, metadata.icons[0]);
            console.log("Storing dapp session",dapp_session);
            sessionStorage.setItem(session.topic,JSON.stringify(dapp_session));
            });



            // Listen for the rejection event from the secondary window
            await webview.once('connect-rejected', async (response) => {
                // Handle the rejection logic here
                console.log('Wallet connect was rejected', response);
                webview.close();
                throw new Error("User Rejected");
            });

            {/* Approve/Reject Connection window -- END*/ }

        } catch (error) {
            console.log("Rejecting session...")
            await this.theWallet?.rejectSession({
                id: proposal.id,
                reason: getSdkError("USER_REJECTED")
            })

            console.log("Rejected. Error info...")
            console.log(error)
        }
        finally {
            console.log()
            console.log("  <<< session_proposal event <<<")
            console.log("  ============================== ")
            console.log()
        }
    }

    private async onSessionRequest(requestEvent: Web3WalletTypes.SessionRequest) {

        console.log()
        console.log()
        console.log("  ============================= ")
        console.log("  >>> session_request event >>>")
        console.log()

        try {
            if (!this.theWallet || !this.aleo_wallet) {
                console.log("Wallet is null! Call setup()");
                return;
            }

            if (!requestEvent) {
                console.log("Missing requestEvent data.");
                return;
            }

            console.log('request', requestEvent)

            const topic = requestEvent.topic;
            const requestSession = this.theWallet.engine.signClient.session.get(requestEvent.topic)
            console.log("requestSession", requestSession)

           

            // set the verify context so it can be displayed in the projectInfoCard
            this.currentRequestVerifyContext = requestEvent.verifyContext;

            // Call information chain | method
            const chainId = requestEvent.params.chainId;
           
            const request_method = requestEvent.params.request.method;
            console.log(`Handling request for ${chainId} | ${request_method}...`)

            let response: JsonRpcResult | JsonRpcError
                = formatJsonRpcError(requestEvent.id, `Chain unsupported ${chainId}`);


            if (chainId === this.aleo_wallet.chainName()) {
                response = await this.aleo_wallet.invokeMethod(requestEvent);
            }
            else {
                console.log(`Chain unsupported ${chainId}`)
            }

            console.log("Responding with...", response)
            await this.theWallet.respondSessionRequest({ topic, response })
        }
        catch (err) {
            console.log("Failed", (err as Error).message)
            const topic = requestEvent.topic;
            console.log("============>>>> Request event ", requestEvent);
            await this.theWallet?.respondSessionRequest({ topic, response: formatJsonRpcError(requestEvent.id, (err as Error).message) })
        }
        finally {
            console.log()
            console.log("  <<< session_request event <<<")
            console.log("  ============================= ")
            console.log()
        }
    }

    private async onSessionDelete(data: Web3WalletTypes.SessionDelete) {
        console.log('Event: session_delete received')
        console.log(data);
        this.close();
        emit('disconnected', 'disconnected')
    }

    private onSignClientPing(data: PingEventData) {
        console.log('Event: session_ping received')
        console.log(data)
    }

    async pair(uri: string) {
        await this.setup();
        if (!this.theWallet) {
            console.log("Wallet is null call setup()");
            return;
        }

        console.log("Pairing with...", uri);
        await this.theWallet?.pair({ uri });
    }

    async close() {
        /* 
        if (this.pairingTopic) {
            console.log("Closing pairing...")
            await this.theWallet?.core.pairing.disconnect({topic : this.pairingTopic});
            await this.theWallet?.core.history.delete(this.pairingTopic);
        }*/
        if (this.sessionTopic) {
            console.log("Closing pairing...")
            await this.theWallet?.disconnectSession({ topic: this.sessionTopic , reason: getSdkError('USER_DISCONNECTED')});
           // await this.theWallet?.core.history.delete(this.sessionTopic);
        }
        emit('disconnected', 'disconnected')

        console.log("Closing event handling...")
        this.theWallet?.off('session_proposal', this.onSessionProposal)
        this.theWallet?.off('session_request', this.onSessionRequest)
        //this.theWallet?.off('auth_request', this.onAuthRequest)
        this.theWallet?.engine.signClient.events.off('session_ping', this.onSignClientPing)
        this.theWallet?.off('session_delete', this.onSessionDelete)
    }

    /*
    private async onAuthRequest(requestEvent: Web3WalletTypes.AuthRequest) {

        console.log()
        console.log()
        console.log("  ========================== ")
        console.log("  >>> auth_request event >>>")
        console.log()

        try {
            if (!this.theWallet || !this.eth_wallet || !this.aleo_wallet) {
                console.log("Wallet is null! Call setup()");
                return;
            }

            if (!requestEvent) {
                console.log("Missing requestEvent data.");
                return;
            }

            console.log('request', requestEvent)

            // TO DO - TO DO - TO DO - TO DO - TO DO
            //
            // Instead of getting the Etherum account we should get
            // the address for the currently selected account which
            const address = this.eth_wallet.getAddress()
            const iss = `did:pkh:eip155:1:${address}`

            const message = this.theWallet.formatMessage(requestEvent.params.cacaoPayload, iss)
            const signature = await this.eth_wallet.signMessage(message)

            console.log("Responding with...", signature)
            await this.theWallet.respondAuthRequest(
                {
                    id: requestEvent.id,
                    signature: {
                        s: signature,
                        t: 'eip191'
                    }
                },
                iss
            )

        } catch (err) {
            console.log("Failed", (err as Error).message)
        }
        finally {
            console.log()
            console.log("  <<< auth_request event <<<")
            console.log("  ========================== ")
            console.log()
        }
    } 
    */
}