import * as React from "react";
import * as mui from "@mui/material";
import SelectWinners from "./RewardsQuests/SelectWinners";

const Rewards: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
      }}
    >
      <SelectWinners />
    </mui.Box>
  );
};

export default Rewards;
