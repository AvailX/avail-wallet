import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/system";
import avatarImg from "../assets/avatar-img.svg";
import scanIcon from "../assets/scan-icon.svg";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const EllipsisTypography = styled(Typography)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "150px",
});

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const start = text.substring(0, maxLength - 3);
  const end = text.substring(text.length - 3, text.length);
  return `${start}...${end}`;
};

interface IProps {
  onProfileClick: () => void;
  profileAddress: string;
}

const DashboardHeader: FC<IProps> = ({ onProfileClick, profileAddress }) => {
  const address = profileAddress ?? 'aleo1ab3j...82k';
  const truncatedAddress = truncateText(address, 10); 

  const navigate = useNavigate();
  return (
    <Box
      mb={3}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box onClick={onProfileClick} display="flex" alignItems="center">
        <img src={avatarImg} />
        <Box ml={3}>
          <EllipsisTypography fontWeight={700} color="#fff">
             {truncatedAddress}
          </EllipsisTypography>
        </Box>
      </Box>

      <IconButton onClick={() => navigate("/qr-code")}>
        <img src={scanIcon} />
      </IconButton>
    </Box>
  );
};

export default DashboardHeader;
