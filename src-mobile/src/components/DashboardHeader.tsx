import { Box, IconButton, Typography } from "@mui/material";
import avatarImg from "../assets/avatar-img.svg";
import scanIcon from "../assets/scan-icon.svg";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface IProps {
  onProfileClick: () => void;
}

const DashboardHeader: FC<IProps> = ({ onProfileClick }) => {
  const navigate = useNavigate();
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

      <IconButton onClick={() => navigate("/qr-code")}>
        <img src={scanIcon} />
      </IconButton>
    </Box>
  );
};

export default DashboardHeader;
