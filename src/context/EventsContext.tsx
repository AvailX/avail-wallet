import React, {
	createContext, useContext, useState, useEffect,
} from 'react';
import {type SuccinctAvailEvent} from 'src/types/avail-events/event';
import {getRecentAvailEventsSuccinct} from '../services/events/get_events';

// Alerts
import {ErrorAlert} from '../components/snackbars/alerts';

// Define the type of the context state
type RecentEventsContextState = {
	events: SuccinctAvailEvent[];
	setEvents: React.Dispatch<React.SetStateAction<SuccinctAvailEvent[]>>;
	fetchEvents: () => void;
	updateEventList: (newEvent: SuccinctAvailEvent) => void;
	loadedOnce: boolean;
	setLoadedOnce: React.Dispatch<React.SetStateAction<boolean>>;
};

// Create the context
const RecentEventsContext = createContext<RecentEventsContextState | undefined>(undefined);

// Create a custom hook to use the context
export const useRecentEvents = () => {
	const context = useContext(RecentEventsContext);
	if (!context) {
		throw new Error('useRecentEvents must be used within a RecentEventsProvider');
	}

	return context;
};

export const RecentEventsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
	const [events, setEvents] = useState<SuccinctAvailEvent[]>([]);
	const [error, setError] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [loadedOnce, setLoadedOnce] = useState<boolean>(true);

	const fetchEvents = () => {
		// Your existing logic to fetch events
		getRecentAvailEventsSuccinct().then(fetchedEvents => {
			console.log('fired');
			console.log(fetchedEvents);

			// Order the events by date
			fetchedEvents.sort((a, b) => (a.created < b.created) ? 1 : -1);

			setEvents(fetchedEvents);
			setLoadedOnce(false);
		}).catch(error_ => {
			console.log(error_);
			setErrorMessage('Error getting recent activity.');
			setError(true);
		});
	};

	const updateEventList = (newEvent: SuccinctAvailEvent) => {
		/// The newEvent might or might not be already in the events list
		/// our goal is to add it to the list if it is not already there
		/// and if it is, we update the existing event

		const index = events.findIndex(event => event.id === newEvent.id);
		if (index === -1) {
			setEvents(previousEvents => [newEvent, ...previousEvents]);
		} else if (newEvent.status !== events[index].status) {
			fetchEvents();
		}
	};

	return (
		<RecentEventsContext.Provider value={{
			events, setEvents, fetchEvents, updateEventList, loadedOnce, setLoadedOnce,
		}}>
			<ErrorAlert errorAlert={error} setErrorAlert={setError} message={errorMessage}/>
			{children}
		</RecentEventsContext.Provider>
	);
};
