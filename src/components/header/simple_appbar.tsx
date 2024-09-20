import { useScrollTrigger, Box, Typography } from '@mui/material';
import { FC } from 'react';
import BackButton from '../buttons/back';
import AvAppBar from './appbar';

type WrapperProperties = {
  title: string;
};

const SimpleAvAppBar: FC<WrapperProperties> = ({ title }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AvAppBar>
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
        {trigger && (
          <Typography sx={{ color: '#00FFAA', fontSize: '1.1rem' }}>
            {title}
          </Typography>
        )}
        <Box sx={{ width: '15%' }} />
      </Box>
    </AvAppBar>
  );
};

export default SimpleAvAppBar;
