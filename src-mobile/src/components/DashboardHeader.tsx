import { Box, Typography } from "@mui/material";
import avatarImg from "../assets/avatar-img.svg";
import scanIcon from "../assets/scan-icon.svg";
import { FC } from "react";

interface IProps {
  onProfileClick: () => void;
}

const DashboardHeader: FC<IProps> = ({ onProfileClick }) => {
  return (
    <Box
      mb={3}
      display='flex'
      alignItems='center'
      justifyContent='space-between'
    >
      <Box onClick={onProfileClick} display='flex' alignItems='center'>
        <img src={avatarImg} />
        <Box ml={3}>
          <Typography fontWeight={700} color='#fff'>
            aleo1ab3j...82k
          </Typography>
        </Box>
      </Box>

      <img src={scanIcon} />
    </Box>
  );
};

export default DashboardHeader;
