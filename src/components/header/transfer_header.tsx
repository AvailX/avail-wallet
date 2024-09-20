import '../../styles/shapes.css';
import { getInitial } from '../../services/states/utils';
import SearchBar from '../searchabar';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

const TransferHeader = () => {
  const navigate = useNavigate();
  const [initial, setInitial] = useState<string | undefined>('');

  useEffect(() => {
    getInitial(setInitial);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        alignItems: 'center',
        width: '95%',
      }}
    >
      <Box
        className='hex2'
        onClick={() => {
          navigate('/account');
        }}
      >
        <Typography sx={{ color: '#000', fontSize: '1.1rem' }}>
          {initial}
        </Typography>
      </Box>
      <Box sx={{ width: '80%' }}>
        <SearchBar />
      </Box>
    </Box>
  );
};

export default TransferHeader;
