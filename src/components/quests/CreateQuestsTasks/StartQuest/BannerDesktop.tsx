import * as React from "react";
import * as mui from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { useFormContext } from "react-hook-form";

const BannerDesktop: React.FC = () => {
  const { register } = useFormContext();
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        mb: "5%",
        mt: 2,
      }}
    >
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <mui.Typography variant='h4' mb={2} color={"white"} fontWeight={"bold"}>
          Banner -
        </mui.Typography>
        <mui.Typography variant='h4' color={"white"}>
          {" "}
          &nbsp; Desktop
        </mui.Typography>
      </mui.Box>
      <mui.TextField
        {...register("desktopUrl")}
        placeholder='Kindly put in URL'
      />
    </mui.Box>
  );
};

export default BannerDesktop;
