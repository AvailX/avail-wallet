import { Box, Typography } from "@mui/material";
import avatarImg from "../assets/avatar-img.svg";
import { FC } from "react";

interface IProps {
  onClick: () => void;
}

const AvatarDropDown: FC<IProps> = ({ onClick }) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='flex-start'
      sx={{ cursor: "pointer" }}
      onClick={() => onClick()}
      py={2}
      pt={5}
    >
      <img src={avatarImg} />
      <Typography ml={2} fontWeight={700} color='#B0B0B0'>
        aleo1ab3j...82k
      </Typography>
      <Typography
        color='#B0B0B0'
        fontSize='23px'
        fontWeight={500}
        ml={1}
        style={{ rotate: "90deg" }}
      >
        {">"}
      </Typography>
    </Box>
  );
};

export default AvatarDropDown;
