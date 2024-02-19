import React from 'react';
import {
	Card, CardContent, Typography, CardActionArea, Chip,
} from '@mui/material';
import {type Dapp} from '../../assets/dapps/dapps';

type DappProperties = {
	dapp: Dapp;
	onClick?: () => void;
};

const DappView: React.FC<DappProperties> = ({dapp, onClick}) => (
	<Card sx={{
		transition: 'transform 0.2s',
		'&:hover': {
			transform: 'translateY(-5px)',
		},
		bgcolor: 'transparent',
	}}>
		<CardActionArea onClick={onClick}>
			<CardContent sx={{textAlign: 'center'}}>
				<img src={dapp.img} alt='Dapp Icon' style={{
					width: '100px',
					height: '100px',
					margin: '0 auto',
					display: 'block',
				}} />
				<Typography variant='h6' sx={{color: '#fff'}}>{dapp.name}</Typography>
				<Typography variant='body2' color='textSecondary' sx={{color: '#fff'}}>
					{dapp.description}
				</Typography>
				{dapp.tags.map((tag, index) => (
					<Chip key={index} label={tag} sx={{marginRight: '4px', color: '#a3a3a3'}} />
				))}
			</CardContent>
		</CardActionArea>
	</Card>
);

export default DappView;
