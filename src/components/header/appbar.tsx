import { useScrollTrigger, AppBar, alpha, Toolbar } from '@mui/material';
import { ReactNode, FC } from 'react';

type WrapperProperties = {
  children: ReactNode;
};

const AvAppBar: FC<WrapperProperties> = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: trigger ? alpha('#a3a3a3', 0.4) : 'transparent',
        display: 'flex',
        margin: 0,
        padding: 0,
        boxShadow: trigger ? 6 : 'none',
        backdropFilter: trigger ? 'blur(10px)' : 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80px',
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default AvAppBar;
