import * as React from 'react';
import * as mui from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AppsIcon from '@mui/icons-material/Apps';
import {useNavigate, useLocation} from 'react-router-dom';

const BottomNav: React.FC = () => {
	const [value, setValue] = React.useState(handlePostition());

	function handlePostition() {
		const location = useLocation();
		if (location.pathname === '/home') {
			return 0;
		}

		if (location.pathname === '/transfer') {
			return 1;
		}

		if (location.pathname === '/account') {
			return 2;
		}
	}

	const navigate = useNavigate();

	return (
		<mui.Paper sx={{
			position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#081424',
		}} elevation={3}>
			<mui.BottomNavigation
				showLabels
				value={value}
				onChange={(event, newValue) => {
					setValue(newValue);
					console.log(newValue);
				}}
				sx={{bgcolor: '#081424'}}
			>
				<mui.BottomNavigationAction label='My Wallet' icon={<AccountBalanceWalletIcon sx={value === 0 ? {color: '#00FFAA'} : {color: '#FFF'}}/>} style={value === 0 ? {color: '#00FFAA'} : {color: '#FFF'}} onClick={() => {
					navigate('/home');
				}} />
				<mui.BottomNavigationAction label='Transfer' icon={<SwapHorizIcon sx={value === 1 ? {color: '#00FFAA', width: '40px', height: '40px'} : {color: '#FFF', width: '40px', height: '40px'}}/>} style={value === 1 ? {color: '#00FFAA', marginTop: '-4%'} : {color: '#FFF', marginTop: '-4%'}} onClick={() => {
					navigate('/transfer');
				}} />
				<mui.BottomNavigationAction label='Hub' icon={<AppsIcon sx={value === 2 ? {color: '#00FFAA'} : {color: '#FFF'}}/>} style={value === 2 ? {color: '#00FFAA'} : {color: '#FFF'}} />
			</mui.BottomNavigation>
		</mui.Paper>
	);
};

export default BottomNav;
