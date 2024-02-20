import {createTheme, responsiveFontSizes} from '@mui/material';
import {red, blue, green} from '@mui/material/colors';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#43ecd4',
		},
		secondary: {
			main: '#8F41D2',
		},
		error: {
			main: red.A400,
		},
		background: {
			default: '#0F1A2E',
		},
		text: {
			primary: '#FFFFFF',
			secondary: '#00FFAA',
		},
	},
	typography: {

		fontFamily: [
			'DM Sans',
			'sans-serif',
			'Arial',
		].join(','),
	},
});
