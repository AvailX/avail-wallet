import * as React from 'react';
import TextField from '@mui/material/TextField';
import {InputAdornment} from '@mui/material';

import {createTheme, ThemeProvider} from '@mui/material/styles';
import './searchbar.css';
import SearchIcon from '@mui/icons-material/Search';

import {useNavigate} from 'react-router-dom';

// Custom theme to adjust the TextField outline color
const theme = createTheme({
	components: {
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderColor: '#00FFAA',
					'&:hover .MuiOutlinedInput-notchedOutline': {
						borderColor: '#00FFAA', // Change as needed for hover state
					},
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
						borderColor: '#00FFAA', // Outline color for focused state
						borderWidth: '2px',
					},
				},
			},
		},
	},
});

const SearchBox: React.FC = () => {
	const navigate = useNavigate();
	const [dappUrl, setDappUrl] = React.useState<string>('');

	const handleSearch = () => {
		let urlModified = dappUrl.toLocaleLowerCase();

		if (dappUrl === 'arcane' || dappUrl === 'arcane finance') {
			urlModified = 'https://app.arcane.finance';
		}

		if (dappUrl === 'staking') {
			urlModified = 'https://staking.xyz';
		}

		if (dappUrl === 'faucet') {
			navigate('/faucet');
		}

		if (dappUrl === 'ans') {
			urlModified = 'https://testnet3.aleonames.id/account';
		}

		if (dappUrl === 'shadow finance') {
			urlModified = 'https://app.shadowfi.xyz/';
		}

		if (dappUrl === 'alphaswap') {
			urlModified = 'https://app.alphaswap.pro/assets/tokens';
		}

		if (dappUrl === 'payper') {
			urlModified = 'https://app.payper.fi/';
		}

		if (!urlModified.startsWith('https://') && !urlModified.startsWith('http://')) {
			urlModified = 'https://' + urlModified;
		}

		navigate('/browser', {state: urlModified});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<TextField
				className='search-box'
				variant='outlined'
				placeholder='Search DApp url...'
				value={dappUrl}
				onKeyDown={handleKeyDown}
				onChange={e => {
					setDappUrl(e.target.value);
				}}
				InputProps={{
					classes: {
						notchedOutline: 'search-outline',
						input: 'search-input',
					},
					endAdornment: (
						<InputAdornment position='end'>
							<SearchIcon sx={{color: '#00FFAA', cursor: 'pointer'}} onClick={handleSearch}/>
						</InputAdornment>
					),
				}}
				sx={{mt: '5%'}}
			/>
		</ThemeProvider>
	);
};

export default SearchBox;
