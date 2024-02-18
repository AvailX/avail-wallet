import * as React from 'react';

// Material ui components
import {
	Box, Typography, Avatar, alpha,
} from '@mui/material';

// Types

import {type AssetType} from '../../types/assets/asset';

const colorArray = [
	'linear-gradient(-225deg, #7de2fc 0%, #b9b6e5 100%)',
	'linear-gradient(153deg, #a02eed 0%, #474a3b 100%)',
	'linear-gradient(351deg, #c781ff 0%, #a0ee1c 100%)',
	'linear-gradient(308deg, #0278ca 0%, #ad49c6 100%)',
	'linear-gradient(51deg, #e12587 0%, #f83e4d 100%)',
	'linear-gradient(259deg, #f4860f 0%, #7a9001 100%)',
	'linear-gradient(324deg, #991890 0%, #3e27aa 100%)',
	'linear-gradient(201deg, #a78f6c 0%, #a76adc 100%)',
	'linear-gradient(146deg, #5489c4 0%, #e8daf7 100%)',
	'linear-gradient(345deg, #fef30d 0%, #265217 100%)',
];

export const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];

export const getColorFromSymbol = (symbol: string) => {
	const index = symbol.charCodeAt(0) % colorArray.length;
	return colorArray[index];
};

type SlideProperty = {
	onClick: () => void;
};

const Asset: React.FC<AssetType & SlideProperty> = ({image_ref, symbol, total, balance, value, onClick}) => {
	const formatNumber = (number_: number) => {
		number_ = Math.round((number_ + Number.EPSILON) * 100) / 100;
		return number_.toString().replaceAll(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	};

	const amount_string = formatNumber(total);
	const amount_value = formatNumber(Math.round((value * total + Number.EPSILON) * 100) / 100);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				bgcolor: '#1E1D1D',
				borderRadius: '20px',
				padding: '10px 20px',
				width: '40%',
				mt: '2%',
				height: '45px',
				cursor: 'pointer',
				transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out', // Smooth transition for transform and boxShadow
				'&:hover': {
					transform: 'translateY(-5px)', // Moves the card up by 5px
					boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Creates a shadow effect that gives the impression of levitation
					bgcolor: '#2E2D2D',
				},
			}}
			onClick={() => {
				onClick();
			}}
		>
			<Box sx={{display: 'flex', alignItems: 'center'}}>
				{image_ref ? (
					<Avatar
						alt={symbol}
						src={image_ref}
						sx={{width: 40, height: 40}}
					/>
				) : (
					<Avatar
						sx={{
							width: 40,
							height: 40,
							background: getColorFromSymbol(symbol),
							color: 'white',
						}}
					>
						{symbol[0]}
					</Avatar>
				)}
				<Typography variant='body1' color='white' sx={{ml: '10px'}}>
					{symbol}
				</Typography>
			</Box>
			<Box sx={{textAlign: 'right'}}>
				<Typography variant='body1' color='white' sx={{fontWeight: 'bold'}}>
					{amount_string}
				</Typography>
				<Typography variant='body2' color='grey'>
          ~${amount_value}
				</Typography>
			</Box>
		</Box>
	);
};

export default Asset;
