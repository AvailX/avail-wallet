import * as React from 'react';
import * as mui from '@mui/material';
import logo from '../assets/logos/avail-black-icon.svg';
import {useNavigate} from 'react-router-dom';

function EntryPoint(){
	const navigate = useNavigate();
	const goToOther = () => {
		navigate('/wallet-choser');
	};

	React.useEffect(() => {
		const timer = setTimeout(goToOther, 3000); // 5000 milliseconds = 5 seconds

		// Clean up the timer when the component is unmounted
		return () => clearTimeout(timer);
	}, []); // Empty dependency array means this effect runs once on mount

	return (
		<mui.Box sx={{
			display: 'flex', alignItems: 'center', alignContent: 'center', height: '100vh', justifyContent: 'center', bgcolor: '#00FFAA', width: '100vw', overflow: 'hidden',m: 0, p: 0,
		}}
		>
			{/* eslint-disable-next-line no-mixed-spaces-and-tabs */}
			<img src={logo} style={{width: '30%', alignSelf: 'center'}}/>
		</mui.Box>
	);
}

export default EntryPoint;
