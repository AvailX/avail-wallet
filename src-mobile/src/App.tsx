import {
	RouterProvider,
	type RouterProviderProps,
	createBrowserRouter,
} from 'react-router-dom';

import * as React from 'react';

// Screens
import Home from '../views/Home';
import WalletChoser from '../views/WalletChoser';
import BackupWallet from '../views/BackupWallet';
import VerifySaved from '../views/VerifySaved';
import DataPointers from '../views/DataPointers';
import Dashboard from '../views/Dashboard';
import Existing from '../views/Existing';
import SecretRecovery from '../views/SecretRecovery';
import {MobCarousel} from '../views/Mob';

const App: React.FC = () => {
	const router: RouterProviderProps['router'] = createBrowserRouter([
		{path: '/', element: <MobCarousel/>},
		{path: '/wallet-choser', element: <WalletChoser />},
		{path: '/backup-wallet', element: <BackupWallet />},
		{path: '/verify-saved', element: <VerifySaved />},
		{path: '/data-pointers', element: <DataPointers />},
		{path: '/dashboard', element: <Dashboard />},
		{path: '/existing', element: <Existing/>},
		{path: '/secret-recovery', element: <SecretRecovery/>},
	]);

	return <RouterProvider router={router} />;
};

export default App;
