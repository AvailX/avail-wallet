import * as React from "react";
import * as mui from "@mui/material";
import MiniDrawer from "../../components/sidebar";
import revampBg from "../../assets/images/backgrounds/seed_bg.png";

type LayoutWrapperProperties = {
  children: React.ReactNode;
};

const SeedLayout: React.FC<LayoutWrapperProperties> = ({ children }) => (
  <div>
    {/* <MiniDrawer></MiniDrawer> */}

    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        //backgroundColor: "#081424",
        backgroundColor: "#000000",
        minWidth: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        paddingTop: "50px",

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

export default SeedLayout;
