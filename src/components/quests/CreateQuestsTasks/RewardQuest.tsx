/* eslint-disable @typescript-eslint/object-curly-spacing */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/quotes */

import * as React from "react";
import * as mui from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PickReward from "./RewardsQuests/PickReward";
import SelectWinners from "./RewardsQuests/SelectWinners";

const schema = yup.object().shape({
  rewardType: yup.string().required("Reward type is required"),
  winners: yup
    .number()
    .positive()
    .integer()
    .required("Number of winners is required"),
  allocation: yup.string().required("Allocation method is required"),
});

const Rewards: React.FC = () => {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // handle form submission here
  };

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
