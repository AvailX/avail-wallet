import * as React from "react";
import * as mui from "@mui/material";
import AddTasks from "./TaskQuests/AddTasks";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

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
      <AddTasks></AddTasks>
      <mui.IconButton
        sx={{
            position: "absolute", // Use absolute positioning for precise control
            top: "95px", // Position at bottom with desired margin from edge
            right: "10px", // Position at right with desired margin from edge
            height: "40px",
            width: "40px",
            borderRadius: "100%",
            backgroundColor: "grey",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
        aria-label="add"
      >
        <AddCircleOutlineOutlinedIcon sx={{ color: "#00FFAA" }} />{" "}
        {/* Replace AddIcon with your desired icon component */}
      </mui.IconButton>
    </mui.Box>
  );
};

export default TasksQuests;
