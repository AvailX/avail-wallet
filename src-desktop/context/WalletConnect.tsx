import * as React from "react";
import { Manager } from "../services/wallet-connect/Manager";

type ProviderProperties = {
  children: React.ReactNode;
};

type Context = {
  Manager: Manager;
  activeUrl: string;
  setActiveUrl: (url: string) => void;
};

// Create a context for the Manager
const Context = React.createContext<Context | undefined>(undefined);

// Provider component to wrap the app and initialize the Manager
export const Provider: React.FC<ProviderProperties> = ({ children }) => {
  const [activeUrl, setActiveUrl] = React.useState("");
  const manager = new Manager();
  const shouldRunEffect = React.useRef(true);
  manager.setup();

  React.useEffect(() => {
    if (!shouldRunEffect.current) {
      return;
    }

    console.log("Provider useEffect");
    // Initialize the Manager when the component mounts
    shouldRunEffect.current = false;
  }, []);

  // Create something that is called when the app is closed to manager.close()
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      manager.close();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <Context.Provider value={{ Manager: manager, activeUrl, setActiveUrl }}>
      {children}
    </Context.Provider>
  );
};

// Custom hook to access the Manager instance
export const useManager = (): Context => {
  const manager = React.useContext(Context);
  if (!manager) {
    throw new Error("Manager not found in context");
  }

  return manager;
};
