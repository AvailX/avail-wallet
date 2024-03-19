import React from 'react';
import ReactDOM from 'react-dom/client';
import {
	createBrowserRouter,
	RouterProvider,
	Route,
	Link,
} from 'react-router-dom';
import App from './App';

// Screens
import Register from './views-desktop/register';
import HomeDesktop from './views-desktop/home-desktop';
import Login from './views-desktop/login';
import Verify from './views-desktop/verify';
import Settings from './views-desktop/settings';
import Activity from './views-desktop/activity';
import BrowserView from './views-desktop/browser';
import Send from './views-desktop/send';
import Recovery from './views-desktop/recovery';
import SeedPhrase from './views-desktop/seedphrase';
import Nfts from './views-desktop/nft';
import PrivacyPolicy from './views-desktop/privacy-policy';
import TermsAndConditions from './views-desktop/terms-and-conditions';
import Oops from './views-desktop/oops';
import Import from './views-desktop/import';

// global font styles
import './index.css';

// global states
import {ScanProvider} from './context/ScanContext';
import {WalletConnectProvider} from './context/WalletConnect';
import {RecentEventsProvider} from './context/EventsContext';

// Languages
import i18n from './i18next-config';
import FaucetView from './views-desktop/faucet';
import Faucet from './views-desktop/faucet';

// See if language is set in local storage
const storedLanguage = localStorage.getItem('language');

if (storedLanguage) {
	await i18n.changeLanguage(storedLanguage);
} else {
	await i18n.changeLanguage('en');
}

const platform = true;

const router = createBrowserRouter([
	{path: '/', element: <App />}, // MVP
	{path: '/register', element: <Register />},
	{path: '/home', element: <HomeDesktop />},
	{path: '/login', element: <Login />},
	{path: '/send', element: <Send />},
	{path: '/recovery', element: <Recovery />},
	{path: '/seed', element: <SeedPhrase />},
	{path: '/verify', element: <Verify />},
	{path: '/settings', element: <Settings />},
	{path: '*', element: <Oops />},
	{path: '/activity', element: <Activity />},
	{path: '/browser', element: <BrowserView />},
	{path: '/faucet', element: <Faucet />},
	{path: '/support', element: <a href='discord://EeuhRNwx' />},
	{path: '/nfts', element: <Nfts />},
	{path: '/privacy-policy', element: <PrivacyPolicy />},
	{path: '/terms-of-service', element: <TermsAndConditions />},
	{path: '/import', element: <Import />},
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(

	<React.StrictMode >
		<WalletConnectProvider>
			<ScanProvider>
				<RecentEventsProvider>
					<RouterProvider router={router} />
				</RecentEventsProvider>
			</ScanProvider>
		</WalletConnectProvider>
	</React.StrictMode>,

);
