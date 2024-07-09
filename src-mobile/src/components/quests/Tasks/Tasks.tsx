import * as React from "react";
import * as mui from "@mui/material";

type Task = {
  title: string;
  description: string;
  points: number;
};

type Quest = {
  // Define the properties of Quest as per your requirements
};

type TaskBoxProps = {
  task: Task;
  quest: Quest;
  questCompleted: boolean;
};

const TaskBox: React.FC<TaskBoxProps> = ({ task, quest, questCompleted }) => {
  return (
    <mui.Box
      sx={{
        border: "1px solid #404040",
        borderRadius: 4,
        p: 2,
        mb: 2,
        height: "150px",
        bgcolor: "#000000",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <mui.Box
        sx={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <mui.Box>
          <mui.Typography
            variant="body1"
            sx={{ color: "#fff", fontWeight: "bold" }}
          >
            {task.title}
          </mui.Typography>
          <mui.Typography variant="body2" sx={{ color: "#fff" }}>
            {task.description}
          </mui.Typography>
        </mui.Box>
        <mui.Box>
          <mui.Typography variant="body2" sx={{ color: "#00FFAA" }}>
            {task.points} Avail Points
          </mui.Typography>
        </mui.Box>
      </mui.Box>
      <mui.Box
        sx={{
          borderRadius: 1.5,
          height: "30px",
          width: "120px",
          bgcolor: "#00FFAA",
          transform: "translateY(300%)",
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          justifyItems: "center",
          justifyContent: "center",
        }}
      >
        <mui.Typography
          variant="body2"
          sx={{
            color: "#000000",
          }}
        >
          Go To Transfer
        </mui.Typography>
      </mui.Box>
    </mui.Box>
  );
};

export default TaskBox;
