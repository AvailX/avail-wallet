import React, {useState} from 'react';
import {
	FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
} from '@mui/material';

type SeedLengthSelectorProperties = {
	chosenLength: Length;
	setChosenLength: React.Dispatch<React.SetStateAction<Length>>;
	sx?: any;
};
export type Length = {
	label: string;
	value: number;
};

const SeedLengthSelector: React.FC<SeedLengthSelectorProperties> = ({sx, chosenLength, setChosenLength}) => {
	const lengths = [
		{label: '12 Words', value: 12},
		{label: '15 Words', value: 15},
		{label: '18 Words', value: 18},
		{label: '21 Words', value: 21},
		{label: '24 Words', value: 24},
	];

	return (
		<FormControl variant='outlined' sx={sx}>
			<InputLabel id='language-selector-label' sx={{color: '#fff', '&.Mui-focused': {color: '#fff'}}}>Length</InputLabel>
			<Select
				labelId='seed-length-selector-label'
				id='seed-length-selector'
				value={chosenLength.value}
				onChange={e => {
					console.log('Seed Length Changed');
					const selectedLength = e.target.value;
					const length = lengths.find(length_ => length_.value === selectedLength);
					if (length) {
						setChosenLength(length);
					}
				}}
				label='Choose '
				sx={{
					color: '#fff', borderColor: 'lightgray', '& .MuiOutlinedInput-notchedOutline': {borderColor: 'lightgray'},
					'&:hover .MuiOutlinedInput-notchedOutline': {borderColor: 'lightgray'}, '&.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: '#00FFAA'},
				}}
			>
				{Object.values(lengths).map(length => (
					<MenuItem key={length.value} value={length.value}>
						{length.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default SeedLengthSelector;
