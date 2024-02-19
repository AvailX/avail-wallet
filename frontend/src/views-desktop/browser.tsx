import React from 'react';
import * as mui from '@mui/material';

// Components
import {listen} from '@tauri-apps/api/event';
import {useLocation} from 'react-router-dom';
import MiniDrawer from '../components/sidebar';
import ReAuthDialog from '../components/dialogs/reauth';
import DappView from '../components/dApps/dapp';
import {dapps} from '../assets/dapps/dapps';

// Tauri tools

// global state
import {useWalletConnectManager} from '../context/WalletConnect';
import Browser from '../browser/nova_browser';
import {Title2Text} from '../components/typography/typography';
import Layout from './reusable/layout';

const BrowserView: React.FC = () => {
	const location = useLocation();

	const [url, setUrl] = React.useState('');
	const [reauthDialogOpen, setReauthDialogOpen] = React.useState(false);

	// TODO - Handle the activeUrl state
	const {activeUrl, setActiveUrl} = useWalletConnectManager();

	function handleUrl() {
		console.log('Location State ' + location.state);
		if (location.state !== undefined) {
			const state = location.state as string;
			setUrl(state);
			setActiveUrl(state);
		} else if (activeUrl !== '') {
			setUrl(activeUrl);
		}
	}

	function handleDappSelection(url: string) {
		console.log('handleDappSelection', url);
		setUrl(url);
		setActiveUrl(url);
	}

	React.useEffect(() => {
		handleUrl();
	}, []);

	/* --Event Listners */
	React.useEffect(() => {
		listen('reauthenticate', event => {
			setReauthDialogOpen(true);
		});
	}, []);

	if (location.state !== undefined && location.state !== null && location.state !== '') {
		return (
			<Layout>
				<ReAuthDialog isOpen={reauthDialogOpen} onRequestClose={() => {
					setReauthDialogOpen(false);
				}} />
				<MiniDrawer />
				<Browser initialUrl={location.state} handleDappSelection={handleDappSelection} />
			</Layout>
		);
	}

	return (
		<Layout>
			<ReAuthDialog isOpen={reauthDialogOpen} onRequestClose={() => {
				setReauthDialogOpen(false);
			}} />
			<MiniDrawer />
			<Browser initialUrl={url} handleDappSelection={handleDappSelection} />

		</Layout>
	);
};

export default BrowserView;
