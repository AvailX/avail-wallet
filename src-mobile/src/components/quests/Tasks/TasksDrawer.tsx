import * as React from "react";
import * as mui from "@mui/material";
import greenGlow from "../../../../../src/assets/dapps/gglow.png";
import Close from "@mui/icons-material/Close";
import TaskBox from "../Tasks/Tasks"; // Adjust the import path as necessary
import { Quest, Task } from "../../../types/quests/quest_types";

// Services
import { isQuestCompleted } from "../../../services/quests/quests";

interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  quest: Quest;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({ open, onClose, quest }) => {
  const [questCompleted, setQuestCompleted] = React.useState(false);

  React.useEffect(() => {
    isQuestCompleted(quest.id)
      .then((res) => {
        if (res) {
          setQuestCompleted(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [quest]);

  const handleClose = () => {
    onClose();
  };

  return (
    <mui.Drawer
      anchor="bottom"
      open={open}
      sx={{
        "& .MuiDrawer-paper": {
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          backgroundImage: `linear-gradient(to right, transparent 100%, #171717 0%),url(${greenGlow})`,
          height: "60%", // Drawer height
          backgroundColor: "#171717",
          left: "50%",
          width: "100%",
          transform: "translateX(-50%)",
          alignSelf: "center",
        },
        alignSelf: "center",
      }}
    >
      {/* Close button */}
      <mui.Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <mui.IconButton onClick={handleClose}>
          <Close sx={{ color: "#a3a3a3" }} />
        </mui.IconButton>
      </mui.Box>

      {/* Title */}
      <mui.Typography
        variant="h6"
        sx={{
          color: "#fff",
          ml: "5%",
          mb: 2,
          pb: "2%",
        }}
      >
        Tasks
      </mui.Typography>

      {/* List of containers */}
      <mui.Box sx={{ ml: "5%", mr: "5%" }}>
        {quest.tasks.map((task) => (
          <TaskBox
            key={task.id}
            task={task}
            quest={quest}
            questCompleted={questCompleted}
          />
        ))}
      </mui.Box>
    </mui.Drawer>
  );
};

export default TaskDrawer;

// // Example task, you should replace this with your actual task data

// export const tasks : Task[] = [
//   {
//     id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
//     title: "Complete a transaction on the Avail Wallet.",
//     description: "Complete a transaction on the Avail Wallet.",
//     transaction: true,
//     program_id: "credits.aleo",
//     function_id: "transfer_private",
//     points: 100,
//   },
// ];

export const task: Task = {
  id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
  title: "Complete a transaction on the Avail Wallet.",
  description: "Complete a transaction on the Avail Wallet.",
  transaction: true,
  program_id: "credits.aleo",
  function_id: "transfer_private",
  points: 100,
};
