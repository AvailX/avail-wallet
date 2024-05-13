import * as React from 'react';
import * as mui from '@mui/material';

// Components
import SideMenu from '../components/sidebar';
import {Nft, AirdropNft} from '../components/nft';
import ScanReAuthDialog from '../components/dialogs/scan_reauth';

// Services
import {get_nfts} from '../services/nfts/fetch';
import {getWhitelists, getCollections} from '../services/quests/quests';

// Typography
import {Title2Text, SubtitleText, SubMainTitleText, LargeTitleText} from '../components/typography/typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { open_url } from '../services/util/open';
import {RiseLoader} from 'react-spinners';

// Types
import {type INft, disruptorWhitelist} from '../types/nfts/nft';
import Layout from './reusable/layout';
import {type WhitelistResponse, type Collection, testCollection} from '../types/quests/quest_types';
import {type AvailError} from '../types/errors';

import {useNavigate} from 'react-router-dom';

import greenGlow from '../assets/images/backgrounds/gglow_quests.png';

import {SuccessAlert, ErrorAlert} from '../components/snackbars/alerts';

function Nfts() {
	const [nfts, setNfts] = React.useState<INft[]>([]);
	const [airdropNfts, setAirdropNfts] = React.useState<Collection[]>([]);
	const [open, setOpen] = React.useState(false);

	const navigate = useNavigate();

	const [success, setSuccessAlert] = React.useState(false);
	const [errorAlert, setErrorAlert] = React.useState(false);
	const [message, setMessage] = React.useState('');
	const [loading, setLoading] = React.useState(true);

	const [selectedAirdropNft, setSelectedAirdropNft] = React.useState<Collection>(testCollection);

	const shouldRunEffect = React.useRef(true);

	const handleWhitelistCollectionCheck = (whitelist: WhitelistResponse, collections: Collection[]) => {
		collections.forEach(collection => {
			if (collection.name === whitelist.collection_name) {
				console.log('Adding airdrop nft');
				console.log(collection);
				console.log(airdropNfts);
				setAirdropNfts([...airdropNfts, collection]);
			}
		});
	};

	const checkWhitelists = (whitelists: WhitelistResponse[], collections: Collection[]) => {
		console.log(whitelists);
		const selectedCollections: Collection[] = [];
		whitelists.forEach(whitelist => {
			collections.forEach(collection => {
				if (collection.name === whitelist.collection_name) {
					selectedCollections.push(collection);
				}
			},
			);
		});

		setAirdropNfts(selectedCollections);
	};

	const handleXlink = async (url: string) => {
		await open_url(url);
	};

	const md = mui.useMediaQuery('(min-width:950px)');

	React.useEffect(() => {
		if (shouldRunEffect.current) {
			getCollections().then(async collections => {
				console.log(collections);
				const whitelists = await getWhitelists();
				console.log(whitelists);

				checkWhitelists(whitelists, collections);
				setLoading(false);
			}).catch(err => {
				const error = err as AvailError;

				if (error.error_type.toString() === 'Unauthorized') {
					// eslint-disable-next-line no-warning-comments
					// TODO - Re-authenticate and fix execution on re-auth (Bala)

					console.log('Unauthorized, re auth');

					setOpen(true);
				} else {
					console.log(error.internal_msg);
					setMessage(error.internal_msg);
					setErrorAlert(true);
				}
			});

			get_nfts().then(nfts => {
				setNfts(nfts);
			}).catch(err => {
				console.log(err);
			});

			shouldRunEffect.current = false;
		}
	}, []);

	return (
		<Layout>
			<ScanReAuthDialog isOpen={open} onRequestClose={() => {
				setOpen(false);
			}} />
			<SuccessAlert successAlert={success} setSuccessAlert={setSuccessAlert} message={message}/>
			<ErrorAlert errorAlert={errorAlert} setErrorAlert={setErrorAlert} message={message}/>
			<SideMenu/>
			<mui.Box sx={{
				ml: '5%', display: 'flex', flexDirection: 'column', width: '95%',
			}}>
				<mui.Box sx={{display: 'flex', flexDirection: 'column', p: '3%', justifyContent: 'center', alignItems: 'center', background: 'url(' + greenGlow + ') no-repeat ', paddingBottom: '7%'}}>
					<LargeTitleText sx={{color: '#00FFAA', textShadow: '0 0 10px #00FFAA'}}> Your NFTs</LargeTitleText>
					<Title2Text sx={{color: '#828282'}}>Own NFTs in private for the first time.</Title2Text>
				</mui.Box>
				<mui.Box sx={{
					display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center',
				}}>
					{/* AirdropNFTs */}
					{airdropNfts.length > 0 && (
						<mui.Grid container spacing={2} sx={{width: '90%', alignSelf: 'center', mt: '5%'}}>
							{airdropNfts.map((collection, index) => (
								<mui.Grid item key={index}>
									<AirdropNft collection={collection} setCollection={setSelectedAirdropNft}/>
								</mui.Grid>
							))}
						</mui.Grid>
					)}
					{/* NFTs */}
					{nfts.length > 0 && (
						<mui.Grid container spacing={2} sx={{width: '90%', alignSelf: 'center', mt: 2}}>
							{nfts.map((nft, index) => (
								<mui.Grid item key={index}>
									<Nft name={nft.name} image={nft.image}/>
								</mui.Grid>
							))}
						</mui.Grid>
					)}

					{/* No NFTs */}
					{nfts.length === 0 && airdropNfts.length === 0 && !loading && (
						<mui.Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '5%'}}>
							<mui.Box sx={{display: 'flex', flexDirection: 'column', bgcolor: '#2A2A2A', width: md ? '120%' : '100%', alignSelf: 'center', borderRadius: '15px'}}>
								<mui.Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', bgcolor: '#00FFAA', width: '100%', borderRadius: '15px', py: 1}}>
									<ErrorOutlineIcon sx={{width: '150px', height: '150px', color: '#2A2A2A'}}/>
									<LargeTitleText sx={{color: '#2A2A2A', ml: '5%'}}>No NFTs Yet</LargeTitleText>
								</mui.Box>
								<mui.Box sx={{display: 'flex', flexDirection: 'column', textAlign: 'flex-start', ml: '2%'}}>
									<SubtitleText sx={{color: '#fff', cursor: 'pointer'}} onClick={()=> {navigate('/campaigns')}}>Go to the In-App quests to earn NFTs</SubtitleText>
									<SubtitleText sx={{color: '#7b7b7b', cursor: 'pointer'}} onClick={()=> {handleXlink('https://x.com/AvailWallet')}}>Or go to @AvailWallet on X for more NFTs</SubtitleText>
								</mui.Box>
							</mui.Box>
						</mui.Box>
					)}

					{loading && (
						<mui.Box sx={{
							display: 'flex', flexDirection: 'column', width: '100%', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '10%',
						}}>
							<RiseLoader color={'#00FFAA'} loading={true} size={45} />
						</mui.Box>
					)
					}
				</mui.Box>
			</mui.Box>
		</Layout>
	);
}

export default Nfts;
