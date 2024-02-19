import * as React from 'react';
import * as mui from '@mui/material';

// Components
import SideMenu from '../components/sidebar';
import Nft from '../components/nft';

// Services
import {get_nfts} from '../services/nfts/fetch';

// Typography
import {Title2Text, SubtitleText, SubMainTitleText} from '../components/typography/typography';

// Types
import {type INft} from '../types/nfts/nft';
import Layout from './reusable/layout';

function Nfts() {
	const [nfts, setNfts] = React.useState<INft[]>([]);

	React.useEffect(() => {
		async function fetchNfts() {
			const nfts = await get_nfts();
			setNfts(nfts);
		}

		fetchNfts();
	}, []);

	return (
		<Layout>
			<SideMenu/>
			<mui.Box sx={{
				ml: '10%', display: 'flex', flexDirection: 'column', width: '90%', mt: '2%',
			}}>
				<Title2Text sx={{color: '#FFF'}}>NFTs</Title2Text>
				<SubtitleText sx={{color: '#a3a3a3'}}>View and Manage your digital assets</SubtitleText>
				<mui.Box sx={{
					display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center',
				}}>
					{/* NFTs */}
					{nfts.length > 0 ? (
						<mui.Grid container spacing={2} sx={{width: '90%', alignSelf: 'center'}}>
							{nfts.map((nft, index) => (
								<mui.Grid item key={index}>
									<Nft name={nft.name} image={nft.image}/>
								</mui.Grid>
							))}
						</mui.Grid>
					) : (
						<mui.Box sx={{alignSelf: 'center', mt: '22%', mr: '10%'}}>
							<SubtitleText sx={{color: '#fff'}}>You don’t have any nfts yet, go explore!</SubtitleText>
						</mui.Box>
					)}
				</mui.Box>
			</mui.Box>
		</Layout>
	);
}

export default Nfts;
