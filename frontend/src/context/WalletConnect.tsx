import * as React from "react";
import { WalletConnectManager } from "../services/wallet-connect/WalletConnectManager";


interface WalletConnectProviderProps {
    children: React.ReactNode;
}

interface WalletConnectContext{
    walletConnectManager: WalletConnectManager;
    activeUrl: string;
    setActiveUrl: (url: string) => void;
}

// Create a context for the WalletConnectManager
const WalletConnectContext = React.createContext<WalletConnectContext | undefined>(undefined);

// Provider component to wrap the app and initialize the WalletConnectManager
export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
    const [activeUrl, setActiveUrl] = React.useState('');
    
    const manager = new WalletConnectManager();
    const shouldRunEffect = React.useRef(true);
   
    React.useEffect(() => {
        if (!shouldRunEffect.current) return;
        console.log('WalletConnectProvider useEffect')
        manager.setup(); // Initialize the WalletConnectManager when the component mounts
        shouldRunEffect.current = false;

    }, []);

    // create something that is called when the app is closed to manager.close()
     React.useEffect(() => {
         const handleBeforeUnload = (e: BeforeUnloadEvent) => {
             e.preventDefault();
             e.returnValue = '';
             manager.close();
         }
         window.addEventListener('beforeunload', handleBeforeUnload);
         return () => {
             window.removeEventListener('beforeunload', handleBeforeUnload);
         }
     }, []);



    return (
        <WalletConnectContext.Provider value={{walletConnectManager:manager,activeUrl,setActiveUrl}}>
            {children}
        </WalletConnectContext.Provider>
    );
};

// Custom hook to access the WalletConnectManager instance
export const useWalletConnectManager = (): WalletConnectContext => {
    const manager = React.useContext(WalletConnectContext);
    if (!manager) {
        throw new Error('WalletConnectManager not found in context');
    }
    return manager;
};
