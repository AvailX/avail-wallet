import * as React from 'react';
import * as mui from '@mui/material';

// Components
import {type SuccinctAvailEvent} from 'src/types/avail-events/event';
import {
	isToday, isThisWeek, isThisMonth, format, set,
} from 'date-fns';
import {useTranslation} from 'react-i18next';
import MiniDrawer from '../components/sidebar';
import AvailEventComponent from '../components/events/event';
import EventDrawer from '../components/events/event_drawer';
import STButton from '../components/buttons/settings-button';

// Services
import {getAvailEventsSuccinct} from '../services/events/get_events';

// Types

// Alerts
import {ErrorAlert} from '../components/snackbars/alerts';

// Testing
import {testEvents} from '../services/wallet-connect/WCTypes';
import Layout from './reusable/layout';

const orderLabels = (groupedEvents: Record<string, SuccinctAvailEvent[]>) => {
	const order = ['Today', 'This Week', 'This Month']; // Base order for known labels

	const sortedKeys = Object.keys(groupedEvents).sort((a, b) => {
		// Check if both labels are in the order array
		const indexOfA = order.indexOf(a);
		const indexOfB = order.indexOf(b);

		if (indexOfA !== -1 && indexOfB !== -1) {
			return indexOfA - indexOfB; // Both labels have a predefined order
		}

		if (indexOfA !== -1) {
			return -1; // Only label A has a predefined order
		}

		if (indexOfB !== -1) {
			return 1; // Only label B has a predefined order
		}

		return a.localeCompare(b); // Neither label has a predefined order, sort alphabetically
	});

	// Construct a new sorted object
	const sortedGroupedEvents: Record<string, SuccinctAvailEvent[]> = {};
	for (const key of sortedKeys) {
		sortedGroupedEvents[key] = groupedEvents[key];
	}

	return sortedGroupedEvents;
};

function Activity() {
	// Alerts
	const [error, setError] = React.useState<boolean>(false);
	const [errorMessage, setErrorMessage] = React.useState<string>('');

	const [events, setEvents] = React.useState<SuccinctAvailEvent[]>([]);
	const [groupedEvents, setGroupedEvents] = React.useState<Record<string, SuccinctAvailEvent[]>>({});

	// Event drawer states
	const [eventDrawerOpen, setEventDrawerOpen] = React.useState(false);
	const [event, setEvent] = React.useState<SuccinctAvailEvent | undefined>();
	const [page, setPage] = React.useState(0);

	const [isLoading, setIsLoading] = React.useState(false);
	const loader = React.useRef(null);

	const {t} = useTranslation();

	const groupEventsByTimeSection = (events: SuccinctAvailEvent[]) => {
		const groupedEvents: Record<string, SuccinctAvailEvent[]> = {};

		for (const event of events) {
			let label = '';

			if (isToday(event.created)) {
				label = t('activity.time-labels.today');
			} else if (isThisWeek(event.created)) {
				label = t('activity.time-labels.this-week');
			} else if (isThisMonth(event.created)) {
				label = t('activity.time-labels.this-month');
			} else {
				label = format(event.created, 'MMMM yyyy'); // E.g., January 2024
			}

			groupedEvents[label] ||= [];

			groupedEvents[label].push(event);
		}

		// Sort the events within each group by date in descending order
		for (const key of Object.keys(groupedEvents)) {
			groupedEvents[key].sort((a, b) => {
				console.log(JSON.stringify(a));
				console.log(JSON.stringify(b));
				const dateA = new Date(a.created);
				const dateB = new Date(b.created);
				return dateB.getTime() - dateA.getTime();
			});
		}

		const orderedGroupedEvents = orderLabels(groupedEvents);

		return orderedGroupedEvents;
	};

	const handleGetEvents = async (page: number) => {
		setIsLoading(true);

		const request = {
			filter: undefined,
			page,
		};

		getAvailEventsSuccinct(request).then(fetchedEvents => {
			setEvents(previousEvents => [...previousEvents, ...(fetchedEvents)]);
			setGroupedEvents(groupEventsByTimeSection([...events, ...fetchedEvents]));
			setIsLoading(false);
		}).catch(error_ => {
			console.log(error_);
			setIsLoading(false);
			setErrorMessage(t('activity.messages.error'));
			setError(true);
		});
	};

	// Event Drawer services
	const handleEventDrawerOpen = (event: SuccinctAvailEvent) => {
		setEvent(event);
		setEventDrawerOpen(true);
	};

	const handleEventDrawerClose = () => {
		setEventDrawerOpen(false);
	};

	const handlePage = () => {
		handleGetEvents(page);
		setPage(page => page + 1);
	};

	const shouldRunEffect = React.useRef(true);
	React.useEffect(() => {
		if (shouldRunEffect.current) {
			handleGetEvents(0);
			setPage(1);
		}

		shouldRunEffect.current = false;
	}, []);

	return (
		<Layout>
			<ErrorAlert errorAlert={error} setErrorAlert={setError} message={errorMessage} />
			<MiniDrawer />
			<mui.Box sx={{
				display: 'flex', flexDirection: 'column', ml: '10%', mt: '5%',
			}}>
				{Object.entries(groupedEvents).map(([section, events]) => (
					<React.Fragment key={section}>
						<mui.Typography variant='h6' sx={{color: '#FFF'}}>
							{section}
						</mui.Typography>
						{events.map(event => (
							<AvailEventComponent event={event} slideFunction={() => {
								handleEventDrawerOpen(event);
							}} fromAsset={false} key={event.id} />
						))}
					</React.Fragment>
				))}
				{events.length === 0 && (
					<mui.Typography variant='h6' sx={{
						color: '#FFF', alignSelf: 'center', mr: '10%', mt: '25%',
					}}>
						{t('activity.no_acitvities')}
					</mui.Typography>
				)}

				{events.length > 0 && (
					<mui.Box sx={{display: 'flex', width: '100%'}}>
						{/* TODO -This should only display when there are pages left to load, Call get pages */}
						<STButton onClick={handlePage} text={isLoading ? t('activity.loading') : t('activity.load-more')} />
					</mui.Box>
				)}
				<EventDrawer open={eventDrawerOpen} onClose={handleEventDrawerClose} event={event} />
			</mui.Box>
		</Layout>
	);
}

export default Activity;
