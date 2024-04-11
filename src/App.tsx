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
import React from 'react';

function App() {
	const transferPublicTest = async() => {	
		console.log('====> Inside Transfer Public');
		const result = await invoke('test_transfer_public_mobile').then(res => {	console.log('====> Inside snark exec'); return res; }).catch((err) => { console.log("ERR",err); });
		console.log(result);
	};

	return (
		<React.Fragment>
			<h1>Testing</h1>
			<button onClick={transferPublicTest} >Transfer Public</button>
		</React.Fragment>
	);
}

export default App;
