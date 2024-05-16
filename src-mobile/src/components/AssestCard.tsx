import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { AssetType } from "../types/assets/asset";

type IProps = Pick<AssetType, "image_ref" | "symbol" | "total" | "value">;

const AssestCard: FC<IProps> = ({ image_ref, symbol, total, value }) => {
  return (
    <Box
      color='#fff'
      bgcolor='#2A2A2A'
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      p={2}
      my={1}
      borderRadius='9px'
    >
      <Box display='flex'>
        <img src={image_ref} />
        <Box ml={1} textAlign='left'>
          <Typography fontWeight={700} fontSize='17px'>
            {symbol}
          </Typography>
          <Typography fontSize='10px' fontWeight={400}>
            {total} {symbol}
          </Typography>
        </Box>
      </Box>
      <Box textAlign='left'>
        <Typography fontSize='17px' fontWeight={500}>
          ${value}
        </Typography>
      </Box>
    </Box>
  );
};

export default AssestCard;
