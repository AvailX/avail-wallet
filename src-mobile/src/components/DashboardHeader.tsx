import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/system";
import avatarImg from "../assets/avatar-img.svg";
import scanIcon from "../assets/scan-icon.svg";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_address } from "../../../src/services/storage/persistent";
import { toast } from "react-toastify";

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
  const addressP = profileAddress ?? 'aleo1ab3j...82k';
  const truncatedAddress = truncateText(addressP, 10);

  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  get_address()
    .then((res) => {
      setAddress(res);
    })
    .catch((error) => {
      console.log(error);
      toast("Failed to get address");
    });

  function shortenAleoAddress(address: string) {
    if (address.length <= 10) {
      return address;
    }
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
  }
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
