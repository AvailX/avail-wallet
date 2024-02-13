import React, { createContext, useContext, useState } from 'react';

interface ScanContextProps {
  scanInProgress: boolean;
  startScan: () => void;
  endScan: () => void;
}

interface ScanProviderProps {
  children: React.ReactNode;
}

const ScanContext = createContext<ScanContextProps | undefined>(undefined);

export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  const [scanInProgress, setScanInProgress] = useState(false);

  const startScan = () => {
    console.log("start scan");
    setScanInProgress(true);
  };

  const endScan = () => {
    setScanInProgress(false);
  };

  return (
    <ScanContext.Provider value={{ scanInProgress, startScan, endScan }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = (): ScanContextProps => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};