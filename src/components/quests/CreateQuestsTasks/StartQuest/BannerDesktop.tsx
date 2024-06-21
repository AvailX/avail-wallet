import * as React from "react";
import * as mui from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const BannerDesktop: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        mb: "5%",
      }}
    >
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <mui.Typography variant="h4" color={"white"} fontWeight={"bold"}>
          Banner -
        </mui.Typography>
        <mui.Typography variant="h4" color={"white"}>
          {" "}
          &nbsp; Desktop
        </mui.Typography>
      </mui.Box>
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "200px",
          width: "100%",
          backgroundColor: "#2A2C2B",
          border: "none",
          borderRadius: "15px",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <mui.Typography color={"white"}>
          Recommended Size 1920 x 1080
        </mui.Typography>
        <ImageOutlinedIcon
          sx={{ color: "white", marginTop: "10px", fontSize: "60px" }}
        />
        <mui.Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "15px",
            border: "1px dashed white",
            pointerEvents: "none",
          }}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default BannerDesktop;
