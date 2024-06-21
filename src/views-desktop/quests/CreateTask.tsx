import * as React from "react";
import { useState } from "react";
import * as mui from "@mui/material";
import StartIcon from "@mui/icons-material/PlayArrow";
import TaskIcon from "@mui/icons-material/Assignment";
import RewardIcon from "@mui/icons-material/EmojiEvents";

import Layout from "../reusable/layout";
import SideMenu from "../../components/sidebar";
import StartQuests from "../../../src/components/quests/CreateQuestsTasks/StartQuests";
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
        <mui.Box sx={{ borderRadius: 2, overflow: "hidden", margin: 2, width: "60%" }}>
          <mui.Tabs
            value={tabValue}
            onChange={handleChange}
            aria-label="create quest tabs"
            TabIndicatorProps={{
              sx: { display: "none" },
            }}
          >
            <mui.Tab
              icon={<StartIcon />}
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
            />
            <mui.Tab
              icon={<TaskIcon />}
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
            />
            <mui.Tab
              icon={<RewardIcon />}
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
            />
          </mui.Tabs>
        </mui.Box>
        <mui.Box sx={{ padding: 2 }}>
          {tabValue === 0 && <StartQuests />}
          {tabValue === 1 && <TasksQuests />}
          {tabValue === 2 && <RewardsQuests />}
        </mui.Box>
      </mui.Box>
    </Layout>
  );
};

export default CreateTasks;
