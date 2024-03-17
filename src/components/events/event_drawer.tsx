import * as React from 'react';
import {
	Box, Drawer, IconButton, Typography, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

//Images
import failed from '../../assets/icons/failed-icon.svg';
import pending from '../../assets/icons/pending-icon.svg';

// Components
import {RiseLoader} from 'react-spinners';

// Services
import {getAvailEvent} from '../../services/events/get_events';

// Types
import {type AvailEvent, AvailEventStatus} from '../../services/wallet-connect/WCTypes';
import {EventType, EventStatus} from '../../services/wallet-connect/WCTypes';
import {
	SubMainTitleText, SubtitleText, BodyText, BodyText500,
} from '../typography/typography';

// Util
import {type SuccinctAvailEvent} from '../../types/avail-events/event';
import {parseProgramId} from './event';
import Transition from './transition';
import Explorer from './explorer';

export type EventDrawerProps = {
	open: boolean;
	onClose: () => void;
	event: SuccinctAvailEvent | undefined;
};

export const formatLongString = (string_: string) => {
	if (string_.length > 20) {
		return string_.slice(0, 20) + '...';
	}

	return string_;
};

const EventDrawer: React.FC<EventDrawerProps> = ({open, onClose, event}) => {
	const [fullEvent, setFullEvent] = React.useState<AvailEvent | undefined>(undefined);
	const [loading, setLoading] = React.useState<boolean>(true);

	React.useEffect(() => {
		if (event) {
			getAvailEvent(event.id).then(fetchedEvent => {
				setFullEvent(fetchedEvent);
				setLoading(false);
			}).catch(error => {
				console.log(error);
				setLoading(false);
			});
		}
	}, [event]);

	if (event === undefined) {
		return (
			<></>
		);
	}

	const formatDate = (date: Date) => new Date(date).toLocaleDateString([], {
		month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',
	});

	if (fullEvent === undefined || loading) {
		return (
			<Drawer
				anchor='bottom'
				open={open}
				onClose={onClose}
				sx={{
					'& .MuiDrawer-paper': {
						borderTopLeftRadius: '20px',
						borderTopRightRadius: '20px',
						height: '82%', // Drawer height
						overflow: 'hidden', // Prevent scrolling on the entire drawer
						bgcolor: '#1E1D1D',
						width: '85%',
						alignSelf: 'center',
						ml: '7.5%',
					},
				}}
			>
				<Box sx={{
					overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column',
				}}> {/* Allows scrolling only within the drawer */}
					{/* Close button */}
					<Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
						<IconButton onClick={onClose} sx={{color: '#a3a3a3'}}>
							<CloseIcon />
						</IconButton>
					</Box>
					<Box sx={{
						display: 'flex', flexDirection: 'column', width: '80%', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: '100%',
					}}>
						<RiseLoader color={'#00FFAA'} loading={true} size={20} />
					</Box>
				</Box>
			</Drawer>
		);
	}else{

	const {type, from, to, amount, fee, message, created, transitions, fee_transition, transactionId, programId, functionId, network, status,error} = fullEvent;
	const explorer_link = `https://explorer.hamp.app/transaction?id=${transactionId}`;
	return (
		<Drawer
			anchor='bottom'
			open={open}
			onClose={onClose}
			sx={{
				'& .MuiDrawer-paper': {
					borderTopLeftRadius: '20px',
					borderTopRightRadius: '20px',
					height: '82%', // Drawer height
					overflow: 'hidden', // Prevent scrolling on the entire drawer
					bgcolor: '#1E1D1D',
					width: '85%',
					alignSelf: 'center',
					ml: '7.5%',
				},
			}}
		>
			<Box sx={{
				overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column',
			}}> {/* Allows scrolling only within the drawer */}
				{/* Close button */}
				<Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
					<IconButton onClick={onClose} sx={{color: '#a3a3a3'}}>
						<CloseIcon />
					</IconButton>
				</Box>

				<Box sx={{
					padding: 2, display: 'flex', flexDirection: 'column', width: '80%', alignSelf: 'center',
				}}>
					<Box sx={{
						display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
					}}>
						<SubMainTitleText sx={{color: '#fff'}}>

							{(type == EventType.Send && to)
								? (`Sent to @${formatLongString(to)}`)
								: (type == EventType.Send && !to) ? ('Sent')
									: (type == EventType.Receive && from) ? (`Received from @${formatLongString(from)}`)
										: (type == EventType.Receive && !from) ? ('Received')
											: (type == EventType.Execute && programId && functionId) ? (`Executed ${programId}/${functionId}`)
												: (type == EventType.Execute && functionId) ? (`Executed ${functionId}`)
													: (type == EventType.Execute) ? ('Executed')
														: (type == EventType.Deploy) ? (`Deployed program ${programId}`) : ('')
							}

						</SubMainTitleText>
						<Box sx={{
							display: 'flex', flexDirection: 'row', width: '30%', justifyContent: 'flex-end',
						}}>
							<BodyText500 color='#00FFAA' sx={{ml: '2%'}}>
								{network === 'AleoTestnet' ? 'Testnet' : network}
							</BodyText500>
							<BodyText500 color='#00FFAA' sx={{ml: '1%'}}>
                  • {AvailEventStatus[status]}
							</BodyText500>
						</Box>
					</Box>
					<Divider sx={{
						mt: '1%', mb: '2%', color: '#fff', bgcolor: '#a3a3a3',
					}} />
					{/* Explorer link */}
					<Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
						<Explorer link={explorer_link} />
					</Box>
					{amount && programId
              && <Box sx={{
              	display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%',
              }}>
              	<BodyText500 sx={{color: '#a3a3a3'}}>
                  Amount:
              	</BodyText500>
              	<BodyText sx={{color: '#00FFAA', ml: '9.5%'}}>
              		{amount} {parseProgramId(programId)}
              	</BodyText>
              </Box>
					}
					{fee
              && <Box sx={{
              	display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%',
              }}>
              	<BodyText500 sx={{color: '#a3a3a3'}}>
                  Fee:
              	</BodyText500>
              	<BodyText sx={{color: '#fff', ml: '14%'}}>
              		{fee}
              	</BodyText>
              </Box>
					}
					{message
              && <Box sx={{
              	display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%',
              }}>
              	<BodyText500 sx={{color: '#a3a3a3'}}>
                  Message:
              	</BodyText500>
              	<BodyText sx={{color: '#fff', ml: '8.5%'}}>
              		{message}
              	</BodyText>
              </Box>
					}
					<Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						<BodyText500 sx={{color: '#a3a3a3'}}>
                Created:
						</BodyText500>
						<BodyText sx={{color: '#fff', ml: '9.5%'}}>
							{formatDate(created)}
						</BodyText>
					</Box>
				{transactionId &&
					<Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						<BodyText500 sx={{color: '#a3a3a3'}}>
                Transaction Id:
						</BodyText500>
						<BodyText sx={{color: '#fff', ml: '3%'}}>
							{transactionId}
						</BodyText>
					</Box>
				}

				{/* Transitions */}
				{transitions.length !== 0 &&
					<SubtitleText sx={{color: '#FFF', mt: '8%'}}>
              Transitions
					</SubtitleText>
				}
					{transitions.map(transition => (
						<Transition key={transition.transitionId} event_transition={transition} />
					))}
					{/* Fee Transition */}
					{fee_transition
              && <Transition event_transition={fee_transition} />
					}

				{/* --Failed-- */}
				{AvailEventStatus[status] == 'Failed' &&
				<Box sx={{display:'flex',flexDirection:'column',alignSelf:'center',width:'80%',justifyContent:'center',mt: '3%',alignItems:'center'}}>
				 <img src={failed} style={{width:'30%',height:'auto'}}/>
				 <Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					bgcolor: '#3a3a3a',
					padding: '16px',
					borderRadius: '8px',
					width: '60%',
					mt: '2%',
				}}>
				<SubtitleText sx={{color: '#FFF',textAlign:'center'}}>
				Transaction failed, but don't worry, no funds were spent.
				</SubtitleText>
				</Box>
				</Box>
				}

				{/* --Pending-- */}
				{AvailEventStatus[status] == 'Pending' &&
				<Box sx={{display:'flex',flexDirection:'row',alignSelf:'center',width:'85%',justifyContent:'space-between', mt:'7%', alignItems: 'center'}}>
				 <Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					bgcolor: '#3a3a3a',
					padding: '16px',
					borderRadius: '8px',
					width: '50%',
					mt:'5%'
				}}>
				<SubtitleText sx={{color: '#FFF'}}>
				Waiting for the transaction to settle on chain...
				</SubtitleText>
				</Box>
				<img src={pending} style={{width:'40%',height:'auto'}}/>
				</Box>
				}

				{/* --Processing-- */}
				{AvailEventStatus[status] == 'Processing' &&
				<Box sx={{
						display: 'flex', flexDirection: 'column', width: '80%', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: '100%', mt:'15%'
					}}>
						<RiseLoader color={'#00FFAA'} loading={true} size={30} />
					</Box>
				}
				</Box>
			</Box>
		</Drawer>
	);
	}
};

export default EventDrawer;
