import React, {type FC} from 'react';

import {Box} from '@mui/material';

import availLogo from '../assets/avail-logo.svg';
import AvatarDropDown from '../components/AvatarDropDown';
import SwipeableEdgeDrawer from '../components/SwipeableDrawer';
import {useNavigate} from 'react-router-dom';

import {invoke} from '@tauri-apps/api/core';

const WalletChoser: FC = () => {
	const [username, setUsername] = React.useState<string>('');
	const [password, setPassword] = React.useState<string>('');
	const [resultMessage, setResultMessage] = React.useState<string>('');
	const [resultMessage2, setResultMessage2] = React.useState<string>('');
	const [open, setOpen] = React.useState<boolean>(false);
	const toggleDrawer = (newOpen: boolean) => (): void => {
		setOpen(newOpen);
	};
	const navigate = useNavigate();
	const goToOther = () => {
		navigate('/backup-wallet');
	};

	async function storePassword(username: string, password: string) {
		await invoke('store_password_apple', {
			service: 'avail.com',
			username: username,
			password: password,
		}).then((res) => {
			setResultMessage(`Password stored successfully: ${res}`);
		}).catch((err) => {
			setResultMessage(`Failed to store password: ${err}`);
		});
	}

	async function getPassword(username: string) {
		await invoke('get_password', {
			service: 'avail.com',
			username: username,
		}).then((res) => {
			setResultMessage2(`Password retrieved successfully: ${res}`);
		}).catch((err) => {
			setResultMessage2(`Failed to retrieve password: ${err}`);
		});
	}

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
			<Box
				height='30vh' // Set the height to 100% of the viewport height
				display='flex'
			>
				<button onClick={goToOther}>
					Next page
				</button>
			</Box>
			<AvatarDropDown onClick={toggleDrawer(true)}/>
			<img
				src={availLogo}
				alt='avail-logo'
				style={{paddingTop: '150px', width: '100%'}}
			/>
			<Box
				height='100vh' // Set the height to 100% of the viewport height
				display='flex'
				flexDirection='column'
				justifyContent='space-between'
				sx={{
					m: 0,
					bgcolor: '#111111',
					p: 1,
				}}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
				/>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"
				/>
				<button onClick={() => storePassword(username, password)}>
					Store Password
				</button>
				{resultMessage && <p style={{ color: 'white' }}>{resultMessage}</p>}
				</Box>
				<Box
					height='100vh' // Set the height to 100% of the viewport height
					display='flex'
					flexDirection='column'
					justifyContent='space-between'
					sx={{
						m: 0,
						bgcolor: '#111111',
						p: 1,
					}}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
				/>
				<button onClick={() => getPassword(username)}>
					Get Password
				</button>
				{resultMessage2 && <p style={{ color: 'white' }}>{resultMessage2}</p>}
			</Box>
			<SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer}/>
		</Box>
	)
		;
};

export default WalletChoser;
