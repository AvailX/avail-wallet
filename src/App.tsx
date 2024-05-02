import React from 'react';
import {useEffect, useState, useRef} from 'react';

/** STYLES */
import {ThemeProvider} from '@emotion/react';
import {theme} from './styles/theme';

/** COMPONENTS */
import Entrypoint from './views-desktop/entrypoint';
import Dapps from './views-desktop/dapps';
import {useWalletConnectManager} from './context/WalletConnect';

import dappPrivacySettingsDialog from './components/dialogs/dappPrivacySettings';

function App() {
	const {walletConnectManager} = useWalletConnectManager();

	useEffect(() => {
		const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';

			await walletConnectManager.close();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	return (
		<ThemeProvider theme={theme} >

			<Dapps/>

		</ThemeProvider>
	);
}

export default App;
