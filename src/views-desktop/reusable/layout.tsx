import { Box } from '@mui/material';
import { ReactNode, FC } from 'react';
import MiniDrawer from '../../components/sidebar';

type LayoutWrapperProperties = {
  children: ReactNode;
};

const Layout: FC<LayoutWrapperProperties> = ({ children }) => (
  <div>
    {/* <MiniDrawer></MiniDrawer> */}

    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // BackgroundColor:"#081424",
        backgroundColor: '#111111',
        minWidth: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </Box>
  </div>
);

export default Layout;
