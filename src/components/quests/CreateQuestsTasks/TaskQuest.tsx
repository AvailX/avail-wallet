import * as React from "react";
import * as mui from "@mui/material";
import AddTasks from "./TaskQuests/AddTasks";

const TasksQuests: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
      }}
    >
      <AddTasks />
    </mui.Box>
  );
};

export default TasksQuests;
