import { Typography, Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import { Tabs, Tab } from "@mui/material";

interface QuestAppBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const QuestAppBar: React.FC<QuestAppBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };
  return (
    <>
      {/* <Stack direction="row" spacing={2}>
        <Typography
          color="#ffffff"
          borderBottom={activeTab === "quests" ? "1px solid #FFFFFF" : ""}
          sx={{
            // position: "absolute",
            // left: "5%",
            // top: "10%",
            fontWeight: activeTab === "quests" ? "bold" : "normal",
            mb: "10px",
            cursor: "pointer", // Add cursor pointer
          }}
          onClick={() => onTabChange("quests")}
        >
          Quests
        </Typography>
        <Typography
          color="#ffffff"
          borderBottom={
            activeTab === "launch-a-quest" ? "1px solid #FFFFFF" : ""
          }
          sx={{
            // position: "absolute",
            // left: "23%",
            // top: "10%",
            fontWeight: activeTab === "launch-a-quest" ? "bold" : "normal",
            mb: "10px",
            cursor: "pointer", // Add cursor pointer
          }}
          onClick={() => onTabChange("launch-a-quest")}
        >
          Launch a Quest
        </Typography>
      </Stack> */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="quest tabs"
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            ".MuiTabs-indicator": { backgroundColor: "#ffffff" },
          }}
          // sx={{ color: "#ffffff" }}
        >
          <Tab label="Quests" value="quests" />
          <Tab label="Launch a Quest" value="launch-a-quest" />
        </Tabs>
      </Box>
    </>
  );
};

export default QuestAppBar;
