import * as React from 'react';
import * as mui from '@mui/material';
import MiniDrawer from '../../components/sidebar';

type LayoutWrapperProperties = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutWrapperProperties> = ({children}) => (
	<div>
		{/* <MiniDrawer></MiniDrawer> */}

		<mui.Box sx={{
			display: 'flex',
			flexDirection: 'column',
			// BackgroundColor:"#081424",
			backgroundColor: '#111111',
			minWidth: '100%',
			minHeight: '100vh',
			margin: 0,
			padding: 0,
		}}>
			{children}
		</mui.Box>
	</div>
);

export default Layout;
