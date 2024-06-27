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
import {
  AddQuestTasksProps,
  Campaign,
} from "../../../src/types/quests/quest_types";
import { useLocation } from "react-router-dom";

type QuestContextType = {
  formField: any;
  setFormField: React.Dispatch<React.SetStateAction<any>>;
};

const QuestContext = React.createContext<QuestContextType | undefined>(
  undefined
);
export const ContextProvider: React.FC<{ children: any }> = ({ children }) => {
  const [formField, setFormField] = React.useState<any>({});
  return (
    <QuestContext.Provider value={{ formField, setFormField }}>
      {children}
    </QuestContext.Provider>
  );
};

export const useQuestContext = (): QuestContextType => {
  const context = React.useContext(QuestContext);
  if (context === undefined) {
    throw new Error("useQuestContext must be used within a ContextProvider");
  }

  return context;
};

const CreateTasks: React.FC = () => {
  const { campaign } = useLocation().state as AddQuestTasksProps;

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (newValue: number) => {
    setTabValue(newValue);
  };
  console.log(campaign.id);

  return (
    <mui.ThemeProvider
      theme={mui.createTheme({
        palette: {
          primary: { main: "#00FFAA" },
        },
        components: {
          MuiTextField: {
            defaultProps: {
              InputLabelProps: {
                style: { color: "#fff", opacity: "50%" },
              },
              InputProps: {
                style: { color: "#fff" },
              },
            },
            styleOverrides: {
              root: {
                "&.MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00FFAA",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00FFAA",
                  },
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                "&.MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00FFAA",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00FFAA",
                  },
                },
              },
            },
          },
        },
      })}
    >
      <Layout>
        <SideMenu />
        <ContextProvider>
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
                iconPosition='start'
                label='Start'
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
                onClick={(event) => handleChange(0)}
              />
              <ArrowForwardIosOutlinedIcon
                sx={{ color: "#00FFAA", fontSize: "large" }}
              />
              <mui.Tab
                icon={<DoneIcon />}
                iconPosition='start'
                label='Task'
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
                onClick={(event) => handleChange(1)}
              />
              <ArrowForwardIosOutlinedIcon
                sx={{ color: "#00FFAA", fontSize: "large" }}
              />
              <mui.Tab
                icon={<EmojiEventsOutlinedIcon />}
                iconPosition='start'
                label='Rewards'
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
                onClick={(event) => handleChange(2)}
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
              {tabValue === 0 && (
                <StartQuests
                  handleNext={() => {
                    handleChange(1);
                  }}
                />
              )}
              {tabValue === 1 && (
                <TasksQuests
                  handleNext={() => {
                    handleChange(2);
                  }}
                />
              )}
              {tabValue === 2 && <RewardsQuests campaignId={campaign?.id} />}
            </mui.Box>
          </mui.Box>
        </ContextProvider>
      </Layout>
    </mui.ThemeProvider>
  );
};

export default CreateTasks;
