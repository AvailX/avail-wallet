
import {type Web3WalletTypes} from '@walletconnect/web3wallet';

export class SessionInfo {
	static chainlist: string[] = [];

	// Do we support this chain id?
	private static isChainSupported(chainIn?: string): boolean {
		if (!chainIn) {
			return false;
		}

		return this.chainlist.includes(chainIn);
	}

	// Get flat list of requested chains both required and optional
	private static getRequestedChains(proposal: Web3WalletTypes.SessionProposal): string[] {
		if (!proposal) {
			return [];
		}

		const required = [];
		for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
			const chains = key.includes(':') ? key : values.chains;
			if (chains) {
				required.push(chains);
			}
		}

		const optional = [];
		for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
			const chains = key.includes(':') ? key : values.chains;
			if (chains) {
				optional.push(chains);
			}
		}

		return [...new Set([...required.flat(), ...optional.flat()])];
	}

	// Get list of required chains, that are not supported by the wallet
	private static getUnSupportedChains(proposal: Web3WalletTypes.SessionProposal): string[] {
		if (!proposal) {
			return [];
		}

		// Get a list that only includes the proposal required chain
		// leaving out the optional ones...
		const required = [];
		for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
			const chains = key.includes(':') ? key : values.chains;
			if (chains) {
				required.push(chains);
			}
		}

		return required.flat().filter(chain => !this.isChainSupported(chain));
	}

	static show(proposal: Web3WalletTypes.SessionProposal, chainlist: string[]) {
		this.chainlist = chainlist;

		const requestedChains = this.getRequestedChains(proposal);
		console.log('requestedChains', requestedChains);

		const supportedChains = requestedChains.filter(chain => this.isChainSupported(chain));
		console.log('supportedChains', supportedChains);

		const notSupportedChains = this.getUnSupportedChains(proposal);
		console.log('notSupportedChains', notSupportedChains);

		console.log('aleo methods', proposal.params.requiredNamespaces?.aleo?.methods);
	}
}
