import {useEffect, useState, useRef} from 'react';
import {invoke} from '@tauri-apps/api/core';
import * as platform from 'platform';

/** STYLES */
import {ThemeProvider} from '@emotion/react';
import reactLogo from './assets/react.svg';
import {theme} from './styles/theme';

/** COMPONENTS */
import Entrypoint from './views-desktop/entrypoint';
import {useWalletConnectManager} from './context/WalletConnect';

/* Components for Testing */
import Send from './views-desktop/send';
import Home from './views-desktop/home-desktop';

function App() {
	const {walletConnectManager} = useWalletConnectManager();

	useEffect(() => {
		const handleBeforeUnload = async(e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';

			await walletConnectManager.close();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);
	const transferPublicTest = async() => {	
		const result = await invoke('test_transfer_public_mobile');
		console.log(result);
	}

	return (
		<ThemeProvider theme={theme} >

			{/* <Entrypoint/>
			 */}

			 <button onClick={transferPublicTest()} >Transfer Public</button>

		</ThemeProvider>
	);
}

export default App;
