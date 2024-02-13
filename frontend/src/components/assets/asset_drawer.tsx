import * as React from 'react';
import { Box, Drawer, IconButton, Typography,Avatar,Divider } from '@mui/material';

import { useNavigate } from 'react-router-dom';

//icons
import CloseIcon from '@mui/icons-material/Close';

//types
import { AssetType } from '../../types/assets/asset';
import {GetEventsRequest,EventsFilter } from '../../services/wallet-connect/WCTypes';
import { SuccinctAvailEvent } from '../../types/avail-events/event';

//services
import { getAvailEventsSuccinct } from '../../services/events/get_events';

// helper function 
import { getColorFromSymbol } from './asset';

//typography
import {  SmallText, SubMainTitleText, Title2Text ,SubtitleText} from '../typography/typography';

//components
import TransferCTAButton from '../buttons/transfer_cta';
import BalanceInfo from './balances';
import AvailEventComponent from '../events/event';
import Receive from '../dialogs/receive';

//alerts
import { ErrorAlert } from '../snackbars/alerts';


export interface AssetDrawerProps {
    open: boolean;
    onClose: () => void;
    asset: AssetType | undefined;
    address: string;
    username: string;
}

const AssetDrawer: React.FC<AssetDrawerProps> = ({ open, onClose, asset,address,username }) => {

  const [receiveOpen, setReceiveOpen] = React.useState<boolean>(false);
  const [events, setEvents] = React.useState<SuccinctAvailEvent[]>([]);

  const [error, setError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const navigate = useNavigate();

  //TODO - useEffect to getBalance(symbol) and getEvents(symbol)

  React.useEffect(() => {
    let programId = asset?.symbol;

    if (programId !== undefined && programId === "ALEO") {
      programId = "credits.aleo";
    }else if (programId !== undefined){
      programId = programId+".aleo";
    }

    let filter: EventsFilter = {
      programId: programId,
    }
    let request: GetEventsRequest = {
      filter: filter
  }
    
    getAvailEventsSuccinct(request).then((events) => {
      events.sort((a, b) => (a.created < b.created) ? 1 : -1);
      setEvents(events);
    }).catch((err) => {
      console.log(err);
      setErrorMessage("Error getting "+ asset?.symbol +" activity.");
      setError(true);
    });

  },[asset]);

  if (asset === undefined){
    return (
        <></>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          height: '82%', // Drawer height
          overflow: 'hidden', // Prevent scrolling on the entire drawer
          bgcolor:'#1E1D1D',
          width:'85%',
          alignSelf:'center',
          ml:'7.5%'
        },
        alignSelf:'center',
      }}
    >
      <ErrorAlert errorAlert={error} setErrorAlert={setError} message={errorMessage}/>
      <Receive open={receiveOpen} handleClose={()=>setReceiveOpen(false)} address={address} username={username}/>

      <Box sx={{ overflowY: 'auto', height: '100%',display:'flex',flexDirection:'column' }}> {/* Allows scrolling only within the drawer */}
        {/* Close button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{color:'#a3a3a3'}} />
          </IconButton>
        </Box>
        {/* Asset details */}
        <Box sx={{ padding: 2,display:'flex',flexDirection:'column',width:'80%',alignSelf:'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {asset.image_ref ? (
          <Avatar
            alt={asset.symbol}
            src={asset.image_ref}
            sx={{ width: 70, height: 70 }}
          />
        ) : (
          <Avatar
            sx={{
              width: 70,
              height: 70,
              background: getColorFromSymbol(asset.symbol),
              color: 'white',
            }}
          >
            {asset.symbol[0]}
          </Avatar>
        )}
        <SubMainTitleText  sx={{ml:'10px',color:'#FFF'}}>
          {asset.symbol}
        </SubMainTitleText>
        
      </Box>
       <Divider sx={{mt:'1%',mb:'2%',color:'#fff',bgcolor:'#a3a3a3'}} />
       <Box sx={{ display: 'flex', flexDirection:'row',alignItems: 'center',color:'#00FFAA' }}>
        <Title2Text>
            {asset.total}
        </Title2Text>
        <SmallText sx={{color:'#a3a3a3',ml:'1%'}}>
            {asset.symbol}
        </SmallText>
        <BalanceInfo privateAmount={asset.balance.private} publicAmount={asset.balance.public}/>
       </Box>
            <Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center",mt:'4%' }}>
                <TransferCTAButton text="Send" onClick={()=> navigate('/send')}/>
            <Box sx={{width:'4%'}}/>
                <TransferCTAButton text="Receive" onClick={()=> setReceiveOpen(true)}/>
            </Box>
        {/* private/public balance */}
       
       {/* activity */}
        <SubtitleText sx={{color:'#FFF',mt:'4%'}}>
          Activity
        </SubtitleText>
        {events.map((event)=>{
                return(
                    <AvailEventComponent event={event} slideFunction={()=>{}} fromAsset={true}/>                 
                )
            })}
        </Box>
      </Box>
     
    </Drawer>
  );
};

export default AssetDrawer;