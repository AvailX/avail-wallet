import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

//icons 
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

//text
import { BodyText500 } from '../typography/typography';

interface CtaButtonProps {
  text: string;
  onClick?: () => void;
}

const TransferCtaButton = styled(Button)({
  display:'flex',
  flexDirection:'row',
  alignItems:'center',
  backgroundColor: '#00FFAA',
  color: '#111111',
  fontWeight: 'bold',
  padding: '8px 5px',
  borderRadius: '20px',
  transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#00FFAA',
    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
    transform: 'scale(1.03)',
  },
  '&:focus': {
    backgroundColor: '#00FFAA',
    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
  },
  width:'20%',
  alignSelf:'center',
  
});

export default function TransferCTAButton({ text,onClick }: CtaButtonProps) {
  return <TransferCtaButton onClick={onClick}>
    <BodyText500>{text}</BodyText500>
    { (text == "Send")? (
    <ArrowUpward sx={{ color: '#000',width:'24px',height:'24px',marginLeft:'5px'}}/>
   
    ):(
    <ArrowDownward sx={{ color: '#000',width:'24px',height:'24px',marginLeft:'5px'}}/>
    )}
    </TransferCtaButton>;
}

