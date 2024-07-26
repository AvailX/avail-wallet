import { Box, Typography } from "@mui/material";
import Nft from "./Nft";
import availLogo from "../assets/avail-icon.svg";

// Services
import { get_nfts } from "../services/nfts/fetch";
import { getWhitelists, getCollections } from "../services/quests/quests";

// Types
import { type INft, disruptorWhitelist } from "../types/nfts/nft";
import {
  type WhitelistResponse,
  type Collection,
  testCollection,
} from "../types/quests/quest_types";
import { type AvailError } from "../types/errors";

import { useNavigate } from "react-router-dom";

export type NftProps = {
  nft: INft[] | undefined;
};

type NftDisplayProps = {
  nft: INft[];
  onClick: () => void;
};

const NftDisplay: React.FC<NftDisplayProps> = ({ nft, onClick }) => {
  return (
    <Box>
      <Box bgcolor="#FFFFFF" borderRadius="8px" py={1}>
        <Typography fontSize="25px" fontWeight={700} color="#F8133E">
          Privarium
        </Typography>
        <Typography mt={-1} fontWeight={700} fontSize="9px" color="#000000">
          The Private NFT Marketplace
        </Typography>
      </Box>
      <Box display="grid" gap={3} gridTemplateColumns="1fr 1fr">
        {nft.map((nftItem, index) => (
          <Nft
            onClick={onClick}
            key={index}
            name={nftItem.name}
            image={nftItem.image}
          />
        ))}
      </Box>
    </Box>
  );
};

export default NftDisplay;
