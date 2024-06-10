import {
  RouterProvider,
  type RouterProviderProps,
  createBrowserRouter,
} from "react-router-dom";

import * as React from "react";
import { testCampaign, quests } from "../src/types/quests/quest_types";

// Screens
import EntryPoint from "./views/Entrypoint";
import WalletChoser from "./views/WalletChoser";
import BackupWallet from "./views/create-wallet/BackupWallet";
import VerifySaved from "./views/create-wallet/VerifySaved";
import DataPointers from "./views/create-wallet/DataPointers";
import Dashboard from "./views/Dashboard";
import SecretRecovery from "./views/create-wallet/SecretRecovery";
import { MobCarousel } from "./views/create-wallet/CreateWallet";
import AvailPoints from "./views/AvailPoints";
import Send from "./views/send/Send";
import InputRecipient from "./views/send/InputRecipient";
import QrCode from "./views/QrCode";
import Settings from "./views/Settings";
import ChooseMethod from "./views/add-an-existing-account/ChooseMethod";
import SeedLogin from "./views/add-an-existing-account/InputSeedPhrase";
import PrivateKeyLogin from "./views/add-an-existing-account/InputPrivateKey";
import QuestsCampaign from "./views/quests/QuestsCampaign";
import QuestsScreen from "./views/quests/QuestsScreen";
import DappsPage from "./views/dapps/Dapps";

const App: React.FC = () => {
  const router: RouterProviderProps["router"] = createBrowserRouter([
    /* --EntryPoint-- */
    { path: "/", element: <EntryPoint /> },
    /* --Create Wallet Flow-- */
    { path: "/wallet-choser", element: <WalletChoser /> },
    { path: "/backup-wallet", element: <BackupWallet /> },
    { path: "/verify-saved", element: <VerifySaved /> },
    { path: "/data-pointers", element: <DataPointers /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/secret-recovery", element: <SecretRecovery /> },
    { path: "/points", element: <AvailPoints /> },
    { path: "/send", element: <Send /> },
    { path: "/input-send", element: <InputRecipient /> },
    { path: "/qr-code", element: <QrCode /> },
    { path: "/settings", element: <Settings /> },
    /* --Existing Wallet Flow-- */
    { path: "/add-wallet", element: <ChooseMethod /> },
    { path: "/seed-phrase", element: <SeedLogin /> },
    { path: "/private-key", element: <PrivateKeyLogin /> },
    /* --Dapp Flow-- */
    { path: "/dapps", element: <DappsPage /> },
    /* --Quest Flow-- */
    { path: "/quests", element: <QuestsScreen /> },
    { path: "/campaign", element: <QuestsCampaign /> },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
