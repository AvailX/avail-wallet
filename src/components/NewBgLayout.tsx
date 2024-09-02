import { Box } from '@mui/material';
import { ReactNode } from 'react';

import bgImg from '../assets/images/backgrounds/avail-gradients.png';

interface IProps {
  children: ReactNode;
}

const NewBgLayout = ({ children }: IProps) => {
  return (
    <Box
      minHeight='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
      sx={{
        background: `url(${bgImg})`,
      }}
    >
      {children}
    </Box>
  );
};

export default NewBgLayout;
