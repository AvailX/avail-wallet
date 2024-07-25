import { Box, Typography } from "@mui/material";
import Nft from "./Nft";
import availLogo from "../assets/avail-icon.svg";

const NftDisplay = ({ onClick }: { onClick: () => void }) => {
  const nftData = [
    {
      name: "NFT 1",
      image:
        "https://s3-alpha-sig.figma.com/img/f510/c686/9fdeda41bb14359d6b892fd643d1af15?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=GKmWHJby2Dey0th3yE04nvZLaLXYr5YwL~OyUoQHOtFpVcH6-CekTKSXnaiR-h52RimFUVSJ0XEuJGSEfUn90Y3cguM5Iil2MivE1p9pkva55DOpfQ1neLF3o~6-qgytX0tGvLIGTG9zxUwMrMV2NtC3Q993k0b7osBFGK54didZqO8pv8oix0eAEFXaoOwT56N5NumDZdUO77c7iqHkC60S9kw~vKsxGdjcGIYbdZGaltqniWVPpvC1R8CMpBkYJ-6~cW9MBcSZ-G2KbC00OnMImwyxVC9-6126iDDjRhXccMLESi3PoB7P1Xub9aWjlHeY19~a0PN5WmoFb-sPRg__",
    },
    {
      name: "NFT 2",
      image:
        "https://s3-alpha-sig.figma.com/img/f510/c686/9fdeda41bb14359d6b892fd643d1af15?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=GKmWHJby2Dey0th3yE04nvZLaLXYr5YwL~OyUoQHOtFpVcH6-CekTKSXnaiR-h52RimFUVSJ0XEuJGSEfUn90Y3cguM5Iil2MivE1p9pkva55DOpfQ1neLF3o~6-qgytX0tGvLIGTG9zxUwMrMV2NtC3Q993k0b7osBFGK54didZqO8pv8oix0eAEFXaoOwT56N5NumDZdUO77c7iqHkC60S9kw~vKsxGdjcGIYbdZGaltqniWVPpvC1R8CMpBkYJ-6~cW9MBcSZ-G2KbC00OnMImwyxVC9-6126iDDjRhXccMLESi3PoB7P1Xub9aWjlHeY19~a0PN5WmoFb-sPRg__",
    },
    {
      name: "NFT 3",
      image:
        "https://s3-alpha-sig.figma.com/img/f510/c686/9fdeda41bb14359d6b892fd643d1af15?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=GKmWHJby2Dey0th3yE04nvZLaLXYr5YwL~OyUoQHOtFpVcH6-CekTKSXnaiR-h52RimFUVSJ0XEuJGSEfUn90Y3cguM5Iil2MivE1p9pkva55DOpfQ1neLF3o~6-qgytX0tGvLIGTG9zxUwMrMV2NtC3Q993k0b7osBFGK54didZqO8pv8oix0eAEFXaoOwT56N5NumDZdUO77c7iqHkC60S9kw~vKsxGdjcGIYbdZGaltqniWVPpvC1R8CMpBkYJ-6~cW9MBcSZ-G2KbC00OnMImwyxVC9-6126iDDjRhXccMLESi3PoB7P1Xub9aWjlHeY19~a0PN5WmoFb-sPRg__",
    },
  ];
  return (
    <Box>
      <Box bgcolor='#FFFFFF' borderRadius='8px' py={1}>
        <Typography fontSize='25px' fontWeight={700} color='#F8133E'>
          Privarium
        </Typography>
        <Typography mt={-1} fontWeight={700} fontSize='9px' color='#000000'>
          The Private NFT Marketplace
        </Typography>
      </Box>
      <Box display='grid' gap={3} gridTemplateColumns='1fr 1fr'>
        {nftData.map((nft, index) => (
          <Nft
            onClick={onClick}
            key={index}
            name={nft.name}
            image={nft.image}
          />
        ))}
      </Box>
    </Box>
  );
};

export default NftDisplay;
