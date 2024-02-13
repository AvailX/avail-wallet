import { AvailEventStatus,EventType } from "../../services/wallet-connect/WCTypes";

export type SuccinctAvailEvent = {
    id: string;
    to? : string;
    from? : string;
    amount? : number;
    fee? : number;
    message? : string;
    type:  EventType;
    status: AvailEventStatus;
    created: Date;
    programId?: string;
    functionId?: string;
}; 
