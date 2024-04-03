import {invoke} from '@tauri-apps/api/core';
import {appDataDir} from '@tauri-apps/api/path';
import {Stronghold, Location, type Client} from '@tauri-apps/plugin-stronghold';

const initStronghold = async (password: string) => {
	const vaultPath = `${await appDataDir()}/vault.hold`;

	const stronghold = await Stronghold.load(vaultPath, password);

	let client: Client;

	const clientName = 'com.avail.stronghold';

	try {
		client = await stronghold.loadClient(clientName);
	} catch {
		client = await stronghold.createClient(clientName);
	}

	return {
		stronghold,
		client,
	};
};

const generateKey = async () => {
    const {stronghold, client} = await initStronghold('password');

}
