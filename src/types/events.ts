import {AvailEvent} from 'src/services/wallet-connect/WCTypes';

export type ScanProgressEvent = {
	progress: number;
};

export type TxScanResponse = {
	txs: boolean;
	block_height: number;
};
