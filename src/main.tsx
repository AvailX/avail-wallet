import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
// Screens
const Register = lazy(() => import('./views-desktop/register'));
const HomeDesktop = lazy(() => import('./views-desktop/home-desktop'));
const Login = lazy(() => import('./views-desktop/login'));
const Verify = lazy(() => import('./views-desktop/verify'));
const Settings = lazy(() => import('./views-desktop/settings'));
const Activity = lazy(() => import('./views-desktop/activity'));
const BrowserView = lazy(() => import('./views-desktop/browser'));
const Send = lazy(() => import('./views-desktop/send'));
const Recovery = lazy(() => import('./views-desktop/recovery'));
const SeedPhrase = lazy(() => import('./views-desktop/seedphrase'));
const Nfts = lazy(() => import('./views-desktop/nft'));
const PrivacyPolicy = lazy(() => import('./views-desktop/privacy-policy'));
const TermsAndConditions = lazy(
  () => import('./views-desktop/terms-and-conditions')
);
const Oops = lazy(() => import('./views-desktop/oops'));
const Import = lazy(() => import('./views-desktop/import'));
const Dapps = lazy(() => import('./views-desktop/dapps'));
const Campaigns = lazy(() => import('./views-desktop/quests/campaigns'));
const Quests = lazy(() => import('./views-desktop/quests/quests'));

// global font styles
import './index.css';

// global states
import { ScanProvider } from './context/ScanContext';
import { WalletConnectProvider } from './context/WalletConnect';
import { RecentEventsProvider } from './context/EventsContext';

// Languages
import i18n from './i18next-config';
import Loader from './components/loader';
const Faucet = lazy(() => import('./views-desktop/faucet'));

// See if language is set in local storage
const storedLanguage = localStorage.getItem('language');

if (storedLanguage) {
  void i18n.changeLanguage(storedLanguage);
} else {
  void i18n.changeLanguage('en');
}

const router = createBrowserRouter([
  { path: '/', element: <App /> }, // MVP
  { path: '/register', element: <Register /> }, // MVP
  { path: '/home', element: <HomeDesktop /> }, // MVP
  { path: '/login', element: <Login /> }, // MVP
  { path: '/send', element: <Send /> }, // MVP ? TBD
  { path: '/recovery', element: <Recovery /> }, // MVP
  { path: '/seed', element: <SeedPhrase /> }, // MVP
  { path: '/verify', element: <Verify /> }, // MVP
  { path: '/settings', element: <Settings /> }, // MVP
  { path: '*', element: <Oops /> },
  { path: '/activity', element: <Activity /> },
  { path: '/browser', element: <BrowserView /> },
  { path: '/faucet', element: <Faucet /> },
  { path: '/support', element: <a href='discord://EeuhRNwx' /> },
  { path: '/nfts', element: <Nfts /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms-of-service', element: <TermsAndConditions /> },
  { path: '/import', element: <Import /> },
  { path: '/dapps', element: <Dapps /> },
  { path: '/campaigns', element: <Campaigns /> },
  { path: '/quests', element: <Quests /> },
  {
    path: '/test',
    element: <Loader />,
  },
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <WalletConnectProvider>
      <ScanProvider>
        <RecentEventsProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </RecentEventsProvider>
      </ScanProvider>
    </WalletConnectProvider>
  </React.StrictMode>
);
