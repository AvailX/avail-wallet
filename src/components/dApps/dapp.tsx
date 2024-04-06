import React from 'react';
import {
	Card, CardContent, Typography, CardActionArea, Chip, useMediaQuery
} from '@mui/material';
import {type Dapp} from '../../assets/dapps/dapps';

type DappProperties = {
	dapp: Dapp;
	onClick?: () => void;
};

const DappView: React.FC<DappProperties> = ({dapp, onClick}) => {
	const sm = useMediaQuery('(min-width:600px)');
	const md = useMediaQuery('(min-width:800px)');
	const lg = useMediaQuery('(min-width:1200px)');
	const xl = useMediaQuery('(min-width:1600px)');

	return (
		<Card sx={{
			transition: 'transform 0.4s',
			'&:hover': {
				transform: 'translateY(-3px)',
				boxShadow: '0 0 10px 0px #00FFAA',
			},
			bgcolor: 'transparent',
			width: xl ? '400px' : lg ? '300px' : '280px',
			height: xl ? '380px' : lg ? '280px' : '260px',
			borderRadius: '12px',
			border: '1px solid #00FFAA',
		}}>
			<CardActionArea onClick={onClick}>
				<CardContent sx={{textAlign: 'center', display: 'flex', flexDirection: 'column'}}>
					<img src={dapp.img} alt='Dapp Icon' style={{
						width: xl ? '100px' : lg ? '80px' : '70px',
						height: xl ? '100px' : lg ? '80px' : '70px',
						display: 'block',
						justifySelf: 'flex-start',
						left: 0,
						boxShadow: `2px 2px 15px 0px ${dapp.color}`,
						borderRadius: '13px',
					}} />
					<Typography sx={{color: '#fff', fontSize: '1.7rem', mt: '5%', textShadow: '0 0 2px #FFF'}}>{dapp.name}</Typography>
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
};

export default DappView;
