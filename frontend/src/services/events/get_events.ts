import { invoke } from "@tauri-apps/api/core";

//types
import {GetAvailEventResponse,GetAvailEventsResponse,GetEventsRequest,GetEventRequest } from "../wallet-connect/WCTypes";
import { AvailEvent } from "../wallet-connect/WCTypes";
import { SuccinctAvailEvent } from "src/types/avail-events/event";

export async function getRecentAvailEvents(){  
    let request = {
        filter: undefined,
        page: 0
    }
    
    const res: AvailEvent[] = await invoke("get_avail_events",{request: request});
    return res;
}

export async function getAvailEvents(request: GetEventsRequest){
    const res: AvailEvent[] = await invoke("get_avail_events",{request: request});
    return res;
}

export async function getAvailEvent(id: string){
    const res: AvailEvent = await invoke("get_avail_event",{id: id});
    return res;
}

export async function getAvailEventSuccinct(id: string){
    const res: SuccinctAvailEvent = await invoke("get_succinct_avail_event",{id: id});
    return res;
}

export async function getAvailEventsSuccinct(request: GetEventsRequest){
    const res: SuccinctAvailEvent[] = await invoke("get_succinct_avail_events",{request: request});
    return res;
}

export async function getRecentAvailEventsSuccinct(){
    let request = {
        filter: undefined,
        page: 0
    }
    
    const res: SuccinctAvailEvent[] = await invoke("get_succinct_avail_events",{request: request});
    return res;
}
