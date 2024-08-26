import * as React from "react";
import * as mui from "@mui/material";
import MiniDrawer from "../../components/sidebar";
import revampBg from "../../assets/images/backgrounds/revamp_bg1.png";

type LayoutWrapperProperties = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutWrapperProperties> = ({ children }) => (
  <div>
    {/* <MiniDrawer></MiniDrawer> */}

    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // BackgroundColor:"#081424",
        backgroundColor: "#111111",
        minWidth: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        backgroundImage: `url(${revampBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "100% auto",
      }}
    >
      {children}
    </mui.Box>
  </div>
);

export default Layout;
