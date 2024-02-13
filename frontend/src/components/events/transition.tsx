import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';

//components
import Explorer from './explorer';

//types
import { EventTransition } from '../../services/wallet-connect/WCTypes';


type TransitionProps = {
    event_transition: EventTransition;
};

const Transition: React.FC<TransitionProps> = ({ event_transition }) => {
    const { transitionId, programId, functionId } = event_transition;
  
    // Adjust the link to match where the Explorer should navigate to
    const explorerLink = `https://explorer.hamp.app/transition?id=${transitionId}`;
  
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#3a3a3a', // Use the appropriate color from your theme
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '8px',
          width: '100%',
          mt:'2%',
          transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out', // Smooth transition for transform and boxShadow
          '&:hover': {
            transform: 'translateY(-5px)', // Moves the card up by 5px
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Creates a shadow effect that gives the impression of levitation
          }
        }}
      >
        <Box sx={{width:'100%'}}>
        <Box sx={{display:'flex',flexDirection:'row',alignItems:'center'}}>
          <Typography variant="body2" sx={{color:'#a3a3a3'}}>
            Transition Id:
          </Typography>
          <Typography variant="body1" sx={{ml:'3%',color:'#fff'}}>{transitionId}</Typography>
          </Box>
          <Box sx={{display:'flex',flexDirection:'row',alignItems:'center'}}>
          <Typography variant="body2" sx={{color:'#a3a3a3'}}>
            Program Id:
          </Typography>
          <Typography variant="body1" sx={{ml:'4.5%',color:'#FFF'}}>{programId}</Typography>
          </Box>
          <Box sx={{display:'flex',flexDirection:'row',alignItems:'center'}}>
          <Typography variant="body2" sx={{color:'#a3a3a3'}}>
            Function Id:
          </Typography>
          <Typography variant="body1" sx={{ml:'4.5%',color:'#FFF'}}>{functionId}</Typography>
          </Box>
        </Box>
        <Explorer link={explorerLink} />
      </Box>
    );
  };
  
  export default Transition;