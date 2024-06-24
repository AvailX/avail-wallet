import * as React from "react";
import * as mui from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const BannerMobile: React.FC = () => {
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
          &nbsp; Mobile
        </mui.Typography>
      </mui.Box>
      <mui.Box
        sx={{
          justifySelf: "center",
          alignSelf: "center",
        }}
      >
        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "140px",
            width: "100%",
            backgroundColor: "#2A2C2B",
            border: "none",
            borderRadius: "15px",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            padding: "10px"
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
    </mui.Box>
  );
};

export default BannerMobile;
