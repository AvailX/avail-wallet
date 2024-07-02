import { Typography, Box } from "@mui/material";
import Stack from "@mui/material/Stack";

interface QuestAppBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const QuestAppBar: React.FC<QuestAppBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      <Stack direction="row" spacing={2}>
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
      </Stack>
    </>
  );
};

export default QuestAppBar;
