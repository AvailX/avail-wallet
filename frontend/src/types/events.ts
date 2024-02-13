import { AvailEvent } from "src/services/wallet-connect/WCTypes";

export interface ScanProgressEvent {
    progress: number;
} 


export interface TxScanResponse{
   txs: boolean,
   block_height: number,
}