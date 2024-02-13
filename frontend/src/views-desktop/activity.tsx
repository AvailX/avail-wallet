import * as React from 'react';
import * as mui from "@mui/material";

//components
import Layout from './reusable/layout';
import MiniDrawer from '../components/sidebar';
import AvailEventComponent from '../components/events/event';
import EventDrawer from '../components/events/event_drawer';
import STButton from '../components/buttons/settings-button';

//services
import { getAvailEventsSuccinct } from '../services/events/get_events';

//types
import { SuccinctAvailEvent } from 'src/types/avail-events/event';
import { isToday, isThisWeek, isThisMonth, format } from 'date-fns';

import { useTranslation } from 'react-i18next';

//alerts
import { ErrorAlert } from '../components/snackbars/alerts';

//testing
import { testEvents } from '../services/wallet-connect/WCTypes';

const orderLabels = (groupedEvents: { [key: string]:  SuccinctAvailEvent[] }) => {
  const order = ['Today', 'This Week', 'This Month']; // Base order for known labels

  const sortedKeys = Object.keys(groupedEvents).sort((a, b) => {
    // Check if both labels are in the order array
    const indexOfA = order.indexOf(a);
    const indexOfB = order.indexOf(b);

    if (indexOfA !== -1 && indexOfB !== -1) {
      return indexOfA - indexOfB; // Both labels have a predefined order
    } else if (indexOfA !== -1) {
      return -1; // Only label A has a predefined order
    } else if (indexOfB !== -1) {
      return 1; // Only label B has a predefined order
    } else {
      return a.localeCompare(b); // Neither label has a predefined order, sort alphabetically
    }
  });

  // Construct a new sorted object
  const sortedGroupedEvents: { [key: string]:  SuccinctAvailEvent[] } = {};
  sortedKeys.forEach((key) => {
    sortedGroupedEvents[key] = groupedEvents[key];
  });

  return sortedGroupedEvents;
};

  

function Activity() {
    //alerts
    const [error, setError] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const [events,setEvents] = React.useState< SuccinctAvailEvent[]>([]);
    const [groupedEvents, setGroupedEvents] = React.useState<{ [key: string]:  SuccinctAvailEvent[] }>({});

    // Event drawer states
    const [eventDrawerOpen, setEventDrawerOpen] = React.useState(false);
    const [event, setEvent] = React.useState< SuccinctAvailEvent | undefined>();
    const [page, setPage] =  React.useState(0);

    const [isLoading, setIsLoading] =  React.useState(false);
    const loader =  React.useRef(null);


    const {t} = useTranslation();
    

    const groupEventsByTimeSection = (events:  SuccinctAvailEvent[]) => {
      const groupedEvents: { [key: string]:  SuccinctAvailEvent[] } = {};
    
      events.forEach((event) => {
        let label = '';
    
        if (isToday(event.created)) {
          label = t("activity.time-labels.today");
        } else if (isThisWeek(event.created)) {
          label = t("activity.time-labels.this-week");
        } else if (isThisMonth(event.created)) {
          label = t("activity.time-labels.this-month");
        } else {
          label = format(event.created, 'MMMM yyyy'); // e.g., January 2024
        }
    
        if (!groupedEvents[label]) {
          groupedEvents[label] = [];
        }
    
        groupedEvents[label].push(event);
      });
  
      let orderedGroupedEvents = orderLabels(groupedEvents);
  
      return orderedGroupedEvents;
    };

    const handleGetEvents = async () => {
        setIsLoading(true);

        let request = {
            filter: undefined,
            page: page
         }
    

       getAvailEventsSuccinct(request).then((fetchedEvents)=>{
            setEvents(prevEvents => [...prevEvents, ...(fetchedEvents )]);
            setGroupedEvents(groupEventsByTimeSection([...events, ...fetchedEvents]));
            setIsLoading(false);
        
       }).catch((err) => {
            setIsLoading(false);
            setErrorMessage(t("activity.messages.error"));
            setError(true);
       });
       
    }


    // Event Drawer services
    const handleEventDrawerOpen = (event: SuccinctAvailEvent) => {
        setEvent(event);
        setEventDrawerOpen(true);
    };

    const handleEventDrawerClose = () => {
        setEventDrawerOpen(false);
    };


    // Observer Handler
  const handlePage = () => {
   
          setPage((page) => page + 1)
      
  };

  
  React.useEffect(() => {
    // have some way of getting other pages when user scrolls down to append to current events
    handleGetEvents();
  }, [page]);


    return (
        <Layout>
          <ErrorAlert errorAlert={error} setErrorAlert={setError} message={errorMessage}/>
      <MiniDrawer />
      <mui.Box sx={{ display: 'flex', flexDirection: 'column', ml: '10%',mt:'5%' }}>
        {Object.entries(groupedEvents).map(([section, events]) => (
          <React.Fragment key={section}>
            <mui.Typography variant="h6" sx={{ color: '#FFF' }}>
              {section}
            </mui.Typography>
            {events.map((event) => (
              <AvailEventComponent event={event} slideFunction={() => handleEventDrawerOpen(event)} fromAsset={false} key={event.id} />
            ))}
          </React.Fragment>
        ))}
        {events.length === 0 && (
          <mui.Typography variant="h6" sx={{ color: '#FFF',alignSelf:'center',mr:'10%',mt:'25%' }}>
            {t("activity.no-activities")}
          </mui.Typography>
        )}
        
        {events.length !== 0 && (
        <mui.Box sx={{ display: 'flex',width:'100%' }}>
          {/* TODO -This should only display when there are pages left to load, Call get pages*/}
        <STButton onClick={handlePage} text={isLoading? t("activity.loading"):t("activity.load-more")}/>
        </mui.Box>
       )}
        <EventDrawer open={eventDrawerOpen} onClose={handleEventDrawerClose} event={event} />
      </mui.Box>
    </Layout>
    );
}

export default Activity;