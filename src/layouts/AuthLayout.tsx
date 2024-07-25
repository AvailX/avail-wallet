import { Box, IconButton } from "@mui/material";
import splashImg from "../assets/green-splash.svg";

import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import GoBack from "../shared/GoBack";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  return (
    <Box height='100vh' position='relative'>
      <Box position='absolute' width='100%' top={0}>
        <img src={splashImg} width='100%' />
      </Box>
      <Box
        bgcolor='black'
        textAlign='center'
        color='#fff'
        pt='10vh'
        height='100%'
        width='100%'
        px={3}
        sx={{ overflowY: "auto" }}
      >
        <GoBack />
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
