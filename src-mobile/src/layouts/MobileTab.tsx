import { Box } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import anchorIcon from "../assets/anchor-icon.svg";
import diamondIcon from "../assets/diamond-icon.svg";
import homeIcon from "../assets/home-icon.svg";

import splashImg from "../assets/green-splash.svg";

interface IProps extends PropsWithChildren {}

const MobileTab: FC<IProps> = ({ children }) => {
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
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pt={1}
        pb={2}
      >
        {MOBILE_TAB.map(({ icon }) => (
          <img src={icon} />
        ))}
      </Box>
    </Box>
  );
};

export default MobileTab;
