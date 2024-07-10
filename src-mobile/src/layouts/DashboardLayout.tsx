// import { Box, IconButton } from "@mui/material";
// import { FC, PropsWithChildren, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// import anchorIcon from "../assets/dashboard_item/anchor-icon.svg";
// import diamondIcon from "../assets/dashboard_item/diamond-icon.svg";
// import homeIcon from "../assets/dashboard_item/home-icon.svg";
// import coloredHomeIcon from "../assets/dashboard_item/home.svg";
// import splashImg from "../assets/green-splash.svg";

// interface IProps extends PropsWithChildren {}

// const DashboardLayout: FC<IProps> = ({ children }) => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<string>("/dashboard");
//   const location = useLocation().pathname;

//   const MOBILE_TAB = [
//     { icon: homeIcon, path: "/dashboard", colorIcon: coloredHomeIcon },
//     { icon: anchorIcon, path: "/send", colorIcon: coloredHomeIcon },
//     { icon: diamondIcon, path: "/settings", colorIcon: coloredHomeIcon },
//   ];

//   const handleTabClick = (path: string) => {
//     if (path !== activeTab) {
//       setActiveTab(path);
//       console.log("Moving to Mobile Tab ==> " + path);
//       navigate(path);
//     }
//   };

//   return (
//     <Box height="100vh">
//       <Box position="absolute" width="100%" top={0}>
//         <img src={splashImg} width="100%" />
//       </Box>
//       <Box
//         bgcolor="black"
//         textAlign="center"
//         color="#fff"
//         pt="10vh"
//         height="90vh"
//         px={3}
//         sx={{ overflowY: "auto" }}
//       >
//         {children}
//       </Box>
//       <Box height="15vh" bgcolor="#2A2A2A" px={4} position="fixed" width="100%">
//         <Box
//           width="100%"
//           mx="auto"
//           height="2px"
//           sx={{
//             background:
//               "linear-gradient(90deg, rgba(0, 255, 170, 0) 0%, #00FFAA 49.35%, rgba(0, 153, 102, 0) 100%)",
//           }}
//         ></Box>
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           pt={1}
//         >
//           {MOBILE_TAB.map(({ icon, path }, index) => (
//             <IconButton key={index} onClick={() => handleTabClick(path)}>
//               <img
//                 src={icon}
//                 alt="icon"
//                 style={{
//                   filter:
//                     path === location
//                       ? "invert(60%) sepia(82%) saturate(3478%) hue-rotate(132deg) brightness(100%) contrast(92%)"
//                       : "none",
//                 }}
//               />
//             </IconButton>
//           ))}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default DashboardLayout;

// //00FFAA

import { Box, IconButton } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import anchorIcon from "../assets/dashboard_item/anchor-icon.svg";
import diamondIcon from "../assets/dashboard_item/diamond-icon.svg";
import homeIcon from "../assets/dashboard_item/home-icon.svg";
import coloredHomeIcon from "../assets/dashboard_item/home.svg";
import splashImg from "../assets/green-splash.svg";

interface IProps extends PropsWithChildren {}

const DashboardLayout: FC<IProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation().pathname;

  const MOBILE_TAB = [
    { icon: homeIcon, path: "/dashboard", colorIcon: coloredHomeIcon },
    { icon: anchorIcon, path: "/send", colorIcon: coloredHomeIcon },
    { icon: diamondIcon, path: "/settings", colorIcon: coloredHomeIcon },
  ];

  const handleTabClick = (path: string) => {
    if (path !== location) {
      console.log("Moving to Mobile Tab ==> " + path);
      navigate(path);
    }
  };

  return (
    <Box height="100vh">
      <Box position="absolute" width="100%" top={0}>
        <img src={splashImg} width="100%" />
      </Box>
      <Box
        bgcolor="black"
        textAlign="center"
        color="#fff"
        pt="10vh"
        height="90vh"
        px={3}
        sx={{ overflowY: "auto" }}
      >
        {children}
      </Box>
      <Box height="15vh" bgcolor="#2A2A2A" px={4} position="fixed" width="100%">
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
          {MOBILE_TAB.map(({ icon, path }, index) => (
            <IconButton key={index} onClick={() => handleTabClick(path)}>
              <img
                src={icon}
                alt="icon"
                style={{
                  filter:
                    path === location
                      ? "invert(60%) sepia(82%) saturate(3478%) hue-rotate(132deg) brightness(100%) contrast(92%)"
                      : "none",
                }}
              />
            </IconButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
