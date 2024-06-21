import * as React from "react";
import * as mui from "@mui/material";

const StartQuests: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      <mui.Box
        sx={{
          alignContent: "start",
        }}
      >
        <mui.Typography variant="h3" color={"white"}>
          Title
        </mui.Typography>
      </mui.Box>
    </mui.Box>
  );
};

export default StartQuests;
