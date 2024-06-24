import * as React from "react";
import * as mui from "@mui/material";
import TitleField from "./StartQuest/TitleField";
import DescribeField from "./StartQuest/DescribeField";
import BannerDesktop from "./StartQuest/BannerDesktop";
import BannerMobile from "./StartQuest/BannerMobile";
import QuestDuration from "./StartQuest/QuestDuration";

const StartQuests: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <TitleField></TitleField>
      <DescribeField></DescribeField>
      <BannerDesktop></BannerDesktop>
      <BannerMobile></BannerMobile>
      <QuestDuration></QuestDuration>
    </mui.Box>
  );
};

export default StartQuests;
