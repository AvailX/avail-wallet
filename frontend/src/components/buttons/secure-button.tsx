import * as React from 'react';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha, styled } from '@mui/material/styles';
import {useMediaQuery } from '@mui/material';




// Styled button with a custom end icon
const SecureButton = styled(Button)(() =>{
  const md = useMediaQuery('(min-width:1000px)');
  const lg =useMediaQuery('(min-width:1200px)');
  return {
  position: 'relative',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: 'white',
  border: '1px solid white',
  boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)', // Heavier white hue
  textTransform: 'none',
  fontSize: 16,
  height: md? 48: 40, // Match the TextField height
  width: md?'55%':'65%', // Match the TextField width
  '&:hover': {
    backgroundColor: alpha('#00FFAA',0.8), // Slight background on hover
    color: '#111111',
  },
  '& .MuiButton-endIcon': {
    position: 'absolute',
    right: 8,
    // Circle background for the icon
    backgroundColor: 'black',
    borderRadius: '50%',
    width: md? 36:30,
    height: md? 36:30,
    color: 'FFF',
    '.MuiSvgIcon-root': { // Position the icon in the center of the circle
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
}});


export default SecureButton;
