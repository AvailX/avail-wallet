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
import { pre_install_inclusion_prover } from './services/transfer/inclusion';

function App() {
	const transferPublicTest = async() => {
		console.log('====> Inside Transfer Public');
		const result = await invoke('test_transfer_public_mobile').then(res => {	console.log('====> Inside snark exec'); return res; }).catch((err) => { console.log("ERR",err); });
		console.log(result);
	};

	const noVMTest = async() => {
		console.log('====> Non snarkVM Test');
		const result = await invoke('test_snarkvm_mobile').then(res => {	console.log('====> After Exec '); return res; }).catch((err) => { console.log("ERR",err); });
		console.log(result);
	};

	const deployVMTest = async() => {
		console.log('====> snarkVM Deploy Test');
		const result = await invoke('test_snarkvm_mobile_deploy').then(res => {	console.log('====> After deploy '); return res; }).catch((err) => { console.log("ERR",err); });
		console.log(result);
	};

	return (
		<React.Fragment>
			<h1>Testing</h1>
			<button onClick={noVMTest}>Test Sign (Non snarkVM)</button>
			<br/>
			<br/>
			<button onClick={transferPublicTest} >Transfer Public</button>
			<br/>
			<br/>
			<button onClick={deployVMTest} >Test snarkVM (Deploy helloworld.aleo)</button>
			<br/>
			<br/>
			<button onClick={pre_install_inclusion_prover} >Inclusion Prover </button>
		</React.Fragment>
	);
}

export default App;
