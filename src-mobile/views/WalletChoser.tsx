import React, {type FC} from 'react';

import {Box} from '@mui/material';

import availLogo from '../assets/avail-logo.svg';
import AvatarDropDown from '../components/AvatarDropDown';
import SwipeableEdgeDrawer from '../components/SwipeableDrawer';

const WalletChoser: FC = () => {
	const [open, setOpen] = React.useState<boolean>(false);
	const toggleDrawer = (newOpen: boolean) => (): void => {
		setOpen(newOpen);
	};

	return (
		<Box
			height='100vh'
			display='flex'
			flexDirection='column'
			justifyContent='space-between'
			sx={{
				m: 0,
				bgcolor: '#111111',
				p: 4,
      }}
    >
      <AvatarDropDown onClick={toggleDrawer(true)} />
      <img
        src={availLogo}
        alt='avail-logo'
        style={{paddingTop: '150px', width: '100%'}}
      />
      <SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer} />
    </Box>
  );
};

export default WalletChoser;
