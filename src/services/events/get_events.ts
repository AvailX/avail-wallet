import {invoke} from '@tauri-apps/api/core';

// Types
import {type SuccinctAvailEvent} from 'src/types/avail-events/event';
import {
	GetAvailEventResponse, GetAvailEventsResponse, type GetEventsRequest, GetEventRequest,
	type AvailEvent,
} from '../wallet-connect/WCTypes';

export async function getRecentAvailEvents() {
	const request = {
		filter: undefined,
		page: 0,
	};

	const res: AvailEvent[] = await invoke('get_avail_events', {request});
	return res;
}

export async function getAvailEvents(request: GetEventsRequest) {
	const res: AvailEvent[] = await invoke('get_avail_events', {request});
	return res;
}

export async function getAvailEvent(id: string) {
	const res: AvailEvent = await invoke('get_avail_event', {id});
	return res;
}

export async function getAvailEventSuccinct(id: string) {
	const res: SuccinctAvailEvent = await invoke('get_succinct_avail_event', {id});
	return res;
}

export async function getAvailEventsSuccinct(request: GetEventsRequest) {
	const res: SuccinctAvailEvent[] = await invoke('get_succinct_avail_events', {request});
	return res;
}

export async function getRecentAvailEventsSuccinct() {
	const request = {
		filter: undefined,
		page: 0,
	};

	const res: SuccinctAvailEvent[] = await invoke('get_succinct_avail_events', {request});
	return res;
}
