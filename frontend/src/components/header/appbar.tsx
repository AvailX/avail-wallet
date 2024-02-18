import * as React from 'react';
import * as mui from '@mui/material';

type WrapperProperties = {
	children: React.ReactNode;
};

const AvAppBar: React.FC<WrapperProperties> = ({children}) => {
	const trigger = mui.useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
	});

	return (
		<mui.AppBar position='fixed' sx={{
			backgroundColor: trigger ? mui.alpha('#a3a3a3', 0.4) : 'transparent', display: 'flex', margin: 0, padding: 0, boxShadow: trigger ? 6 : 'none', backdropFilter: trigger ? 'blur(10px)' : 'none',
		}}>
			<mui.Toolbar sx={{
				display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px',
			}}>
				{children}
			</mui.Toolbar>
		</mui.AppBar>
	);
};

export default AvAppBar;
