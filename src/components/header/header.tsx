import '../../styles/shapes.css';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInitial } from '../../services/states/utils';
import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const [initial, setInitial] = useState<string | undefined>('');

  useEffect(() => {
    getInitial(setInitial);
  }, []);

  const path = useLocation().pathname;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
        alignItems: 'center',
        width: '90%',
      }}
    >
      <Box
        className={path == '/contracts' ? 'hex2' : 'hex1'}
        onClick={() => {
          navigate('/account');
        }}
      >
        <Typography
          sx={{
            color: path == '/contracts' ? '#081424' : '#00FFAA',
            fontSize: '1.2rem',
            fontWeight: '700px',
          }}
        >
          {initial}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '17%' }}>
        <NotificationsIcon
          sx={{
            width: '30px',
            height: '30px',
            color: path == '/contracts' ? '#fff' : '#081424',
          }}
          onClick={() => {
            navigate('/notifications');
          }}
        />
        {path !== '/transfer' && (
          <QrCodeScannerIcon
            sx={{
              width: '30px',
              height: '30px',
              color: path == '/contracts' ? '#fff' : '#081424',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Header;
