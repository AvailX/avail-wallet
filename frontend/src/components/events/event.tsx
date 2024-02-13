import React from 'react';
import * as mui from '@mui/material';

//icons
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FadeLoader } from 'react-spinners';

import { EventType,AvailEvent,EventStatus, AvailEventStatus } from '../../services/wallet-connect/WCTypes';
import { SuccinctAvailEvent } from 'src/types/avail-events/event';
import { formatLongString } from './event_drawer';

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.getDate() == today.getDate();
  const isYesterday = date.getDate() == yesterday.getDate();

  if (isToday) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday';
  }
 
  return new Date(date).toLocaleDateString([],  { month: 'short', day: 'numeric',hour:'numeric',minute:'numeric' });
};

export const parseProgramId = (programId: string) => {
  // an example program id is "program.aleo", the goal of parsing it is to remove the .aleo
  // and turn the returned string to all caps
  const parts = programId.split('.');
  if (parts[0] == "credits"){
    return "ALEO";
  }else{
  return parts[0].toUpperCase();
  }
};

const EventIcon: React.FC<{ type: EventType }> = ({ type }): JSX.Element => {
  switch (type) {
    case EventType.Send:
      return (
        <mui.Box sx={{width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #ccc', bgcolor:'transparent'}}>
      <ArrowUpward sx={{color:'#FFF'}}/>
      </mui.Box>
      );
    case EventType.Receive:
      return (
        <mui.Box sx={{width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #00FFAA', bgcolor:'transparent'}}>
      <ArrowDownward sx={{color:'#00FFAA'}}/>
      </mui.Box>
      );
    case EventType.Execute:
      return (
        <mui.Box sx={{width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #ccc', bgcolor:'transparent'}}>
      <ArrowForward sx={{color:'#FFF'}}/>
      </mui.Box>
      );
    default:
      return <span />;
  }
};

const AvailEventComponent: React.FC<{ event: SuccinctAvailEvent, slideFunction:() => void,fromAsset:boolean  }> = ({ event,slideFunction,fromAsset }) => {
  const {
    type,
    status,
    created,
    fee,
    to,
    from,
    message,
    programId,
    functionId,
    amount
  } = event;


  return (
    <mui.Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: fromAsset?'#363636':'#1E1D1D',
        borderRadius: '20px',
        padding: '10px',
        margin: '10px 0',
        color: 'white',
        mt:'2%',
        width: fromAsset?'100%':'65%',
        cursor:'pointer',
        transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out', // Smooth transition for transform and boxShadow
        '&:hover': {
          transform: 'translateY(-5px)', // Moves the card up by 5px
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Creates a shadow effect that gives the impression of levitation
          bgcolor: '#2E2D2D'
        }
      }}
      onClick={()=>slideFunction()}
    >
      <mui.Box sx={{ display: 'flex', alignItems: 'center' }}>
        <mui.IconButton>
          <EventIcon type={type} />
        </mui.IconButton>
        <mui.Box sx={{ ml: 2,width:'100%' }}>
          <mui.Typography variant="body1">
            
          {(type == EventType.Send && to)?
              (`Sent to @${formatLongString(to)}`):
              (type == EventType.Send && !to)?(`Sent`):
              (type == EventType.Receive && from)?(`Received from @${formatLongString(from)}`):
              (type == EventType.Receive && !from)?(`Received`):
              (type== EventType.Execute && programId && functionId)?(`Executed ${programId}/${functionId}`):
              (type == EventType.Execute && functionId)?(`Executed ${functionId}`):
              (type == EventType.Execute)?(`Executed`):
              (type == EventType.Deploy)?(`Deployed program ${programId}`):('')
            }
          </mui.Typography>
          <mui.Box sx={{display:'flex',flexDirection:'row',alignItems:'center',width:'120%'}}>
          <mui.Typography variant="body2" color="grey">
            {formatDate(new Date(created))} 
          </mui.Typography>
          <mui.Typography variant="body2" color="#00FFAA" sx={{ml:'2%'}}>
              • {AvailEventStatus[status]}
          </mui.Typography>
          { message &&
          <mui.Typography variant="body2" color="#00FFAA" sx={{ml:'2%'}}>
              • {message}
          </mui.Typography>
          }
          {status.toString() === "Processing" &&
          <mui.Box sx={{ml:'15%',mt:'2%'}}>
          <FadeLoader color="#00FFAA" loading={true} height={5} width={5}  speedMultiplier={1.5}  margin={-6}/> 
          </mui.Box>  
          }
          </mui.Box>
        </mui.Box>
      </mui.Box>
      <mui.Box sx={{ textAlign: 'right',display:'flex',flexDirection:'column',alignSelf:fee?'flex-end':'' }}>
        {amount && programId &&  (
          <mui.Typography sx={{color:'#FFF'}}>
            {(amount % 1 == 0)?(
              amount.toFixed(0) +" "+ parseProgramId(programId)
            ):(
              amount.toFixed(2) +" "+ parseProgramId(programId)
            )}            
          </mui.Typography>
        )}
        {fee && (
          <mui.Typography variant="body2" color="#00FFAA">
            Fee {fee.toFixed(2)}
          </mui.Typography>
        )}
        </mui.Box>
    </mui.Box>
  );
};

export default AvailEventComponent;


