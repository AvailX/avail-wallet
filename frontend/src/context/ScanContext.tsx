import React, {createContext, useContext, useState} from 'react';

type ScanContextProperties = {
	scanInProgress: boolean;
	startScan: () => void;
	endScan: () => void;
};

type ScanProviderProperties = {
	children: React.ReactNode;
};

const ScanContext = createContext<ScanContextProperties | undefined>(undefined);

export const ScanProvider: React.FC<ScanProviderProperties> = ({children}) => {
	const [scanInProgress, setScanInProgress] = useState(false);

	const startScan = () => {
		console.log('start scan');
		setScanInProgress(true);
	};

	const endScan = () => {
		setScanInProgress(false);
	};

	return (
		<ScanContext.Provider value={{scanInProgress, startScan, endScan}}>
			{children}
		</ScanContext.Provider>
	);
};

export const useScan = (): ScanContextProperties => {
	const context = useContext(ScanContext);
	if (!context) {
		throw new Error('useScan must be used within a ScanProvider');
	}

	return context;
};
