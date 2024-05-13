import { Box } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import anchorIcon from "../assets/anchor-icon.svg";
import diamondIcon from "../assets/diamond-icon.svg";
import homeIcon from "../assets/home-icon.svg";

interface IProps extends PropsWithChildren {}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const MOBILE_TAB = [
    { icon: homeIcon, link: "home" },
    {
      icon: anchorIcon,
      link: "anchor",
    },
    {
      icon: diamondIcon,
      link: "diamond",
    },
  ];
  return (
    <Box height='100vh'>
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
      <Box height='15vh' bgcolor='#2A2A2A' px={4} position='relative'>
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
          pb={2}
        >
          {MOBILE_TAB.map(({ icon }) => (
            <img src={icon} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
