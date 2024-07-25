import { Box, IconButton, Typography } from "@mui/material";
import avatarImg from "../assets/avatar-img.svg";
import scanIcon from "../assets/scan-icon.svg";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get_address } from "../../src-desktop/services/storage/persistent";
import { toast } from "react-toastify";

interface IProps {
  onProfileClick: () => void;
}

const DashboardHeader: FC<IProps> = ({ onProfileClick }) => {
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
      display='flex'
      alignItems='center'
      justifyContent='space-between'
    >
      <Box onClick={onProfileClick} display='flex' alignItems='center'>
        <img src={avatarImg} />
        <Box ml={3}>
          <Typography fontWeight={700} color='#fff'>
            {shortenAleoAddress?.(address)}
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
