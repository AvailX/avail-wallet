import React from 'react';
import { Typography, Box, Link, SvgIcon } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { useNavigate} from 'react-router-dom';

import { open_url } from '../../services/util/open';

import { SuccessAlert,ErrorAlert } from '../snackbars/alerts';

type ExplorerProps = {
  link: string;
};

const Explorer: React.FC<ExplorerProps> = ({ link }) => {
  const navigate = useNavigate();
  const [success,setSuccess] = React.useState(false);
  const [error,setError] = React.useState(false);
  const [message,setMessage] = React.useState('');

  const handleOpenUrl =()=>{
    open_url(link).then((res)=>{
        setSuccess(true);
        setMessage('Explorer opened');
    }).catch((err)=>{
        setMessage('Error opening explorer');
        setError(true);
    });
  }

  return (
      <>
      <SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
      <ErrorAlert errorAlert={error} setErrorAlert={setError} message={message}/>
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

        onClick={()=> {handleOpenUrl();}}
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
      </>
  );
};

export default Explorer;
