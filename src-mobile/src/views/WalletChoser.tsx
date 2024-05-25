import React, {type FC} from 'react';

import {Box} from '@mui/material';

import availLogo from '../assets/avail-logo.svg';
import AvatarDropDown from '../components/AvatarDropDown';
import SwipeableEdgeDrawer from '../components/SwipeableDrawer';
import {useNavigate} from 'react-router-dom';

import {invoke} from '@tauri-apps/api/core';
import {Languages} from "../../../src/types/languages";
import type {AvailError} from "../../../src/types/errors";
import {register_seed_phrase} from "../../../src/services/authentication/register";

const WalletChoser: FC = () => {
	const [username, setUsername] = React.useState<string>('');
	const [password, setPassword] = React.useState<string>('');
	const [resultMessage, setResultMessage] = React.useState<string>('');
	const [resultMessage2, setResultMessage2] = React.useState<string>('');
	const [resultMessage3, setResultMessage3] = React.useState<string>('');
	const [resultMessage4, setResultMessage4] = React.useState<string>('');
	const [resultMessage5, setResultMessage5] = React.useState<string>('');
	const [open, setOpen] = React.useState<boolean>(false);
	const toggleDrawer = (newOpen: boolean) => (): void => {
		setOpen(newOpen);
	};
	const navigate = useNavigate();
	const goToOther = () => {
		navigate('/backup-wallet');
	};

	async function newWallet() {
		await invoke('create_seed_phrase_wallet', {
			username: undefined, password: "password", access_type: true, backup: false, language: Languages.English, length: 12
		}).then((res) => {
			setResultMessage(`New wallet created successfully: ${res}`);
		}).catch((err: AvailError) => {
			setResultMessage(`Failed to create wallet: ${err.internal_msg} | ${err.external_msg}`);
			console.log(err);
		});
	}

	async function getAddress() {
		await invoke('get_address_string', {
			password: undefined
		}).then((res) => {
			setResultMessage5(`Address retrieved successfully: ${res}`);
		}).catch((err) => {
			setResultMessage5(`Failed to retrieve address: ${err}`);
		});
	}

	async function getPrivateKey() {
		await invoke('get_private_key_tauri', {
			password: undefined
		}).then((res) => {
			setResultMessage2(`Private key retrieved successfully: ${res}`);
		}).catch((err) => {
			setResultMessage2(`Failed to retrieve private key: ${err}`);
		});
	}

	async function getViewKey() {
		await invoke('get_view_key_tauri', {
			password: undefined
		}).then((res) => {
			setResultMessage3(`View key retrieved successfully: ${res}`);
		}).catch((err) => {
			setResultMessage3(`Failed to retrieve view key: ${err}`);
		});
	}

	async function getSeedPhrase() {
		await invoke('get_seed_phrase', {
			password: "password"
		}).then((res) => {
			setResultMessage4(`Seed phrase retrieved successfully: ${res}`);
		}).catch((err) => {
			setResultMessage4(`Failed to retrieve seed phrase: ${err}`);
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
			{/*<img*/}
			{/*	src={availLogo}*/}
			{/*	alt='avail-logo'*/}
			{/*	style={{paddingTop: '150px', width: '100%'}}*/}
			{/*/>*/}
			<Box
				height='200vh' // Set the height to 100% of the viewport height
				display='flex'
				flexDirection='column'
				justifyContent='space-between'
				sx={{
					m: 0,
					bgcolor: '#111111',
					p: 1,
				}}>
				<button onClick={() => newWallet()}>
					Generate new wallet
				</button>
				{resultMessage && <p style={{ color: 'white' }}>{resultMessage}</p>}
				<button onClick={() => getAddress()}>
					Get Address
				</button>
				{resultMessage5 && <p style={{ color: 'white' }}>{resultMessage5}</p>}
				</Box>
				<Box
					height='300vh' // Set the height to 100% of the viewport height
					display='flex'
					flexDirection='column'
					justifyContent='space-between'
					sx={{
						m: 0,
						bgcolor: '#111111',
						p: 1,
					}}>
				<button onClick={() => getPrivateKey()}>
					Get Private Key
				</button>
				{resultMessage2 && <p style={{ color: 'white' }}>{resultMessage2}</p>}
				<button onClick={() => getViewKey()}>
					Get View Key
				</button>
				{resultMessage3 && <p style={{ color: 'white' }}>{resultMessage3}</p>}
				<button onClick={() => getSeedPhrase()}>
					Get Seed Phrase
				</button>
				{resultMessage4 && <p style={{ color: 'white' }}>{resultMessage4}</p>}
			</Box>
			<SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer}/>
		</Box>
	)
		;
};

export default WalletChoser;
