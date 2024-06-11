import { Box, IconButton } from "@mui/material";
import splashImg from "../assets/green-splash.svg";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

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
        <Box display='flex' alignItems='center' justifyContent='flex-start'>
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
          >
            <Box
              display='flex'
              alignItems='center'
              justifyContent='center'
              bgcolor='#393939'
              width='35px'
              height='35px'
              borderRadius='50%'
              p={3}
            >
              <ArrowBackIosNewIcon sx={{ color: "#BDBDBD" }} />
            </Box>
          </IconButton>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
