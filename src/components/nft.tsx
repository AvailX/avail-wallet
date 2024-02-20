import * as React from 'react';
import * as mui from '@mui/material';
import {SmallText400} from './typography/typography';

type NftProperties = {
	name: string;
	image: string;
};

const Nft: React.FC<NftProperties> = ({name, image}) => (
	<mui.Box sx={{
		display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#1f1f1f', padding: 2, marginTop:2
	}}>
		<img src={image} style={{width: 200, height: 200, marginTop:20}} draggable={false}/>
		<SmallText400 sx={{color: '#fff'}}>{name}</SmallText400>
	</mui.Box>
);

export default Nft;
