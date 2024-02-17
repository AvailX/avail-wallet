import { invoke } from "@tauri-apps/api/core";
import { INft } from "../../types/nfts/nft";

export async function get_nfts() {
    const nft_uris = await invoke<string[]>("get_all_nft_data", {});

    // get metadata for each nft, just fetch from nft_uris, they are https links
    const nfts = await Promise.all(nft_uris.map(async (uri) => {
        const metadata = await fetch(uri).then(res => res.json());
        return metadata as INft;
    }));

    return nfts;
}
