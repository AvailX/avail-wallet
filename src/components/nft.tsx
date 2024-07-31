import * as React from 'react';
import * as mui from '@mui/material';
import {SmallText400} from './typography/typography';
import {type Collection} from '../types/quests/quest_types';

type NftProperties = {
	name: string;
	image: string;
};

type AirdropNftProperties = {
	collection: Collection;
	setCollection: (collection: Collection) => void;
};

export const Nft: React.FC<NftProperties> = ({name, image}) => (
	<mui.Box sx={{
		display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#1f1f1f', padding: 2, marginTop:2
	}}>
		<img src={image} style={{width: 200, height: 200, marginTop: 20}} draggable={false}/>
		<SmallText400 sx={{color: '#fff'}}>{name}</SmallText400>
	</mui.Box>
);

export const AirdropNft: React.FC<AirdropNftProperties> = ({collection, setCollection}) => (

	<mui.Card sx={{bgcolor: '#2A2A2A',
		transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out',
		'&:hover': {
			transform: 'translateY(-5px)',
			boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
		}, width: '80%', borderRadius: '15px', mt: 2}}
	onClick={() => {
		setCollection(collection);
	}}
	>
		<mui.CardMedia
			image={collection.whitelist_img}
		/>
		<img src={collection.whitelist_img} style={{width: '100%'}} />
		<mui.CardContent sx={{display: 'flex', textAlign: 'flex-start', flexDirection: 'column', height: '45px', mt: '-5%'}}>
			<mui.Typography sx={{color: '#FFF', fontSize: '1.35rem', fontWeight: 500}}>{collection.name}</mui.Typography>
			<mui.Typography sx={{color: '#7B7B7B', fontSize: '1.1rem'}}>{collection.name === 'Aleo Wizards' ? 'Whitelist' : 'Airdrop'}</mui.Typography>
		</mui.CardContent>
	</mui.Card>
);

export const NoNfts: React.FC = () => (
	<></>
);