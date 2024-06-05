import { Box, Button } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import anchorIcon from "../assets/anchor-icon.svg";
import diamondIcon from "../assets/diamond-icon.svg";
import homeIcon from "../assets/home-icon.svg";

import splashImg from "../assets/green-splash.svg";
import { useNavigate } from "react-router-dom";

interface IProps extends PropsWithChildren {}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const MOBILE_TAB = [
    { icon: homeIcon, path: "/" },
    {
      icon: anchorIcon,
      link: "anchor",
      path: "/dapps",
    },
    {
      icon: diamondIcon,
      link: "diamond",
      path: "/quests",
    },
  ];
  const navigate = useNavigate();

  return (
    <Box height="100vh" position="relative">
      <Box position="absolute" width="100%" top={0}>
        <img src={splashImg} width="100%" />
      </Box>
      {/* <Button onClick={() => navigate("/dashboard")}>Back</Button> */}
      <Box
        bgcolor="black"
        textAlign="center"
        color="#fff"
        pt="10vh" ///Had to comment out to make Campaigns look better
        height="100%"
        width="100%"
        px={3} ///Had to comment out to make Campaigns look better
        sx={{ overflowY: "auto" }}
      >
        {children}
      </Box>
      <Box
        height="10vh"
        bgcolor="#2A2A2A"
        px={4}
        position="absolute"
        width="100%"
        bottom={0}
        sx={{ position: "fixed" }}
      >
        <Box
          width="100%"
          mx="auto"
          height="2px"
          sx={{
            background:
              "linear-gradient(90deg, rgba(0, 255, 170, 0) 0%, #00FFAA 49.35%, rgba(0, 153, 102, 0) 100%)",
          }}
        ></Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pt={1}
        >
          {MOBILE_TAB.map(({ icon, link, path }) => (
            <img
              src={icon}
              key={link}
              onClick={() => {
                navigate(path || "");
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
