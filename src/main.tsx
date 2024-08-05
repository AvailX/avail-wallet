import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from 'react-router-dom';
import App from './App';
// Screens
const Register = lazy(async () => import('./views-desktop/register'));
const HomeDesktop = lazy(async () => import('./views-desktop/home-desktop'));
const Login = lazy(async () => import('./views-desktop/login'));
const Verify = lazy(async () => import('./views-desktop/verify'));
const Settings = lazy(async () => import('./views-desktop/settings'));
const Activity = lazy(async () => import('./views-desktop/activity'));
const BrowserView = lazy(async () => import('./views-desktop/browser'));
const Send = lazy(async () => import('./views-desktop/send'));
const Recovery = lazy(async () => import('./views-desktop/recovery'));
const SeedPhrase = lazy(async () => import('./views-desktop/seedphrase'));
const Nfts = lazy(async () => import('./views-desktop/nft'));
const PrivacyPolicy = lazy(
  async () => import('./views-desktop/privacy-policy')
);
const TermsAndConditions = lazy(
  async () => import('./views-desktop/terms-and-conditions')
);
const Oops = lazy(async () => import('./views-desktop/oops'));
const Import = lazy(async () => import('./views-desktop/import'));
const Dapps = lazy(async () => import('./views-desktop/dapps'));
const Campaigns = lazy(async () => import('./views-desktop/quests/campaigns'));
const Quests = lazy(async () => import('./views-desktop/quests/quests'));

// global font styles
import './index.css';

// global states
import { ScanProvider } from './context/ScanContext';
import { WalletConnectProvider } from './context/WalletConnect';
import { RecentEventsProvider } from './context/EventsContext';

// Languages
import i18n from './i18next-config';
const Faucet = lazy(async () => import('./views-desktop/faucet'));

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
