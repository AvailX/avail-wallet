import BackButton from '../buttons/back';
import '../../styles/shapes.css';
import { Box, Typography } from '@mui/material';

type ChatHeaderProperties = {
  name: string;
};

const ChatHeader: React.FC<ChatHeaderProperties> = ({ name }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <BackButton />

    <Typography sx={{ color: '#00FFAA', fontSize: '1.1rem' }}>
      {name}
    </Typography>

    <Box sx={{ width: '15%' }}>
      <Box className='hex2'>
        <Typography sx={{ color: '#000', fontSize: '1.1rem' }}>
          {name.charAt(0).toUpperCase()}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default ChatHeader;
