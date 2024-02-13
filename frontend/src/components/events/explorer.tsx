import React from 'react';
import { Typography, Box, Link, SvgIcon } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { useNavigate} from 'react-router-dom';

type ExplorerProps = {
  link: string;
};

const Explorer: React.FC<ExplorerProps> = ({ link }) => {

  const navigate = useNavigate();

  return (
   
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#00FFAA',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.7,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        }}

        onClick={()=> {navigate("/browser",{state: link})}}
      >
        <Typography
          variant="h6"
          component="span"
          sx={{ marginRight: '8px', fontWeight: '',fontStyle:'italic' }}
        >
          Explorer
        </Typography>
        <SvgIcon component={NorthEastIcon} sx={{color:'#fff'}}/>
      </Box>
   
  );
};

export default Explorer;
