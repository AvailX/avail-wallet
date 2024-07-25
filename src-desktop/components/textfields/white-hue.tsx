import * as React from 'react';
import TextField from '@mui/material/TextField';
import {styled} from '@mui/material/styles';
import {useMediaQuery} from '@mui/material';

const WhiteHueTextField = styled(TextField)(() => {
	const md = useMediaQuery('(min-width:1000px)');
	const lg = useMediaQuery('(min-width:1200px)');
	return {
		// Default styles
		'& label.Mui-focused': {
			color: 'white',
		},
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: 'white', // White border color
				boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
			},
			'&:hover fieldset': {
				borderColor: 'white', // White border color on hover
				boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)', // Slight white hue when hovered
			},
			'&.Mui-focused fieldset': {
				borderColor: '#00FFAA', // White border color on focus
				boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)', // More intense white hue when focused
			},
		},
		'& input': {
			color: 'white', // Text color
		},
		'& label': {
			color: 'white', // Label color
		},
	};
});

export default WhiteHueTextField;
