import {invoke} from '@tauri-apps/api/core';
import {type INft} from '../../types/nfts/nft';

export async function get_nfts() {
	const nft_uris = await invoke<string[]>('get_all_nft_data', {});

	// Get metadata for each nft, just fetch from nft_uris, they are https links
	const nfts = await Promise.all(nft_uris.map(async uri => {
		const metadata = await fetch(uri).then(async res => res.json());
		//the metadata is either an image or an INft object
		if (metadata.image === undefined) {
			return {
				uri,
				owner: '0x0',
				creator: '0x0',
				contract: '0x0',
				token_id: 0,
				created_at: new Date().toISOString(),
				image: metadata
			};
		} else {
			return metadata as INft;
		}
	}));

	return nfts;
}
