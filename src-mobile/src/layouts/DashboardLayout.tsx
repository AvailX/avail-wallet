import { Box, IconButton } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import anchorIcon from "../assets/anchor-icon.svg";
import diamondIcon from "../assets/diamond-icon.svg";
import homeIcon from "../assets/home-icon.svg";

import splashImg from "../assets/green-splash.svg";

import { useNavigate } from "react-router-dom";

interface IProps extends PropsWithChildren {}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const navigate = useNavigate();
  const MOBILE_TAB = [
    { icon: homeIcon, path: "/dashboard" },
    {
      icon: anchorIcon,
      path: "/dashboard",
    },
    {
      icon: diamondIcon,
      path: "/settings",
    },
  ];
  return (
    <Box height='100vh'>
      <Box position='absolute' width='100%' top={0}>
        <img src={splashImg} width='100%' />
      </Box>
      <Box
        bgcolor='black'
        textAlign='center'
        color='#fff'
        pt='10vh'
        height='90vh'
        px={3}
        sx={{ overflowY: "auto" }}
      >
        {children}
      </Box>
      <Box height='15vh' bgcolor='#2A2A2A' px={4} position='fixed' width='100%'>
        <Box
          width='100%'
          mx='auto'
          height='2px'
          sx={{
            background:
              "linear-gradient(90deg, rgba(0, 255, 170, 0) 0%, #00FFAA 49.35%, rgba(0, 153, 102, 0) 100%)",
          }}
        ></Box>

        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          pt={1}
        >
          {MOBILE_TAB.map(({ icon, path }) => (
            <IconButton
              onClick={() => {
                navigate(path);
              }}
            >
              <img src={icon} key={path} />
            </IconButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
