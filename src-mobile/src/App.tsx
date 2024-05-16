import {
	RouterProvider,
	type RouterProviderProps,
	createBrowserRouter,
} from 'react-router-dom';

import * as React from 'react';

// Screens
import EntryPoint from './views/Entrypoint';
import WalletChoser from './views/WalletChoser';
import BackupWallet from './views/create-wallet/BackupWallet';
import VerifySaved from './views/create-wallet/VerifySaved';
import DataPointers from './views/create-wallet/DataPointers';
import Dashboard from './views/Dashboard';
import SecretRecovery from './views/create-wallet/SecretRecovery';
import {MobCarousel} from './views/create-wallet/CreateWallet';

const App: React.FC = () => {
	const router: RouterProviderProps['router'] = createBrowserRouter([
		/* --EntryPoint-- */
		{path: '/', element: <EntryPoint/>},
		/* --Create Wallet Flow-- */
		{path: '/wallet-choser', element: <WalletChoser />},
		{path: '/backup-wallet', element: <BackupWallet />},
		{path: '/verify-saved', element: <VerifySaved />},
		{path: '/data-pointers', element: <DataPointers />},
		{path: '/dashboard', element: <Dashboard />},
		{path: '/secret-recovery', element: <SecretRecovery/>},
		/* --Existing Wallet Flow-- */
		/* --Dapp Flow-- */
		/* --Quest Flow-- */
	]);

	return <RouterProvider router={router} />;
};

export default App;
