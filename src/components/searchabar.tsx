import React from 'react';
import * as mui from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InputAdornment from '@mui/material/InputAdornment';

const searchBarStyle = {
	width: '75%',
	height: '60px',
	backgroundColor: '#273344',
};

const SearchBar = () => (
	<mui.Box position='relative' sx={{width: '100%', mt: '2%'}}>
		<SearchIcon
			sx={{
				position: 'absolute',
				color: 'white',
				zIndex: '9999',
				left: 9,
				top: 9,
				pl: 1,
			}}
		/>
		<mui.OutlinedInput
			placeholder='@Username'
			size='small'
			aria-label=''
			sx={{
				color: 'white',
				bgcolor: '#293343',
				borderRadius: 10,
				height: '40px',
				pl: 4,
				width: '100%',
			}}
			fullWidth
			endAdornment={
				<InputAdornment position='end'>
					<mui.IconButton edge='end'>
						<QrCodeScannerIcon sx={{color: '#fff', pr: 1}} />
					</mui.IconButton>
				</InputAdornment>
			}
			color='info'
		/>
	</mui.Box>
);

export default SearchBar;
