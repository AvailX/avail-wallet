import * as React from "react";
import * as mui from "@mui/material";
import PickReward from "./RewardsQuests/PickReward";
import SelectWinners from "./RewardsQuests/SelectWinners";
import Allocation from "./RewardsQuests/Allocation";

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
      <PickReward></PickReward>
      <SelectWinners></SelectWinners>
      <Allocation></Allocation>
    </mui.Box>
  );
};

export default Rewards;
