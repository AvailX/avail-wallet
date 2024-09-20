import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Box } from '@mui/material';

const Sent = () => (
  <Box
    sx={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ccc',
      bgcolor: 'transparent',
    }}
  >
    <ArrowUpwardIcon sx={{ width: '20px', height: '20px', color: '#fff' }} />
  </Box>
);

export default Sent;
