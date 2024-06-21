import * as React from "react";
import { useState } from "react";
import * as mui from "@mui/material";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import DoneIcon from "@mui/icons-material/Done";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

import Layout from "../reusable/layout";
import SideMenu from "../../components/sidebar";
import StartQuests from "../../components/quests/CreateQuestsTasks/StartQuests";
import TasksQuests from "../../../src/components/quests/CreateQuestsTasks/TaskQuest";
import RewardsQuests from "../../../src/components/quests/CreateQuestsTasks/RewardQuest";

const CreateTasks: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout>
      <SideMenu />
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <mui.Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60%",
            margin: 2,
          }}
        >
          <mui.Tab
            icon={<PlayArrowOutlinedIcon />}
            iconPosition="start"
            label="Start"
            sx={{
              backgroundColor: tabValue === 0 ? "#238363" : "#0D3C2C",
              color: "#00FFAA",
              "&.Mui-selected": {
                color: "#00FFAA",
              },
              flexGrow: 1,
              padding: 1,
              margin: 1,
              borderRadius: 2,
              minHeight: "auto",
            }}
            onClick={(event) => handleChange(event, 0)}
          />
          <ArrowForwardIosOutlinedIcon
            sx={{ color: "#00FFAA", fontSize: "large" }}
          />
          <mui.Tab
            icon={<DoneIcon />}
            iconPosition="start"
            label="Task"
            sx={{
              backgroundColor: tabValue === 1 ? "#238363" : "#0D3C2C",
              color: "#00FFAA",
              "&.Mui-selected": {
                color: "#00FFAA",
              },
              flexGrow: 1,
              padding: 1,
              margin: 1,
              borderRadius: 2,
              minHeight: "auto",
            }}
            onClick={(event) => handleChange(event, 1)}
          />
          <ArrowForwardIosOutlinedIcon
            sx={{ color: "#00FFAA", fontSize: "large" }}
          />
          <mui.Tab
            icon={<EmojiEventsOutlinedIcon />}
            iconPosition="start"
            label="Rewards"
            sx={{
              backgroundColor: tabValue === 2 ? "#238363" : "#0D3C2C",
              color: "#00FFAA",
              "&.Mui-selected": {
                color: "#00FFAA",
              },
              flexGrow: 1,
              padding: 1,
              margin: 1,
              borderRadius: 2,
              minHeight: "auto",
              minWidth: "auto",
            }}
            onClick={(event) => handleChange(event, 2)}
          />
        </mui.Box>

        <mui.Box
          sx={{
            padding: 2,
            display: "flex",
            width: "60%",
            margin: 2,
          }}
        >
          {tabValue === 0 && <StartQuests />}
          {tabValue === 1 && <TasksQuests />}
          {tabValue === 2 && <RewardsQuests />}
        </mui.Box>
      </mui.Box>
    </Layout>
  );
};

export default CreateTasks;
