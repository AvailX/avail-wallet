import React from "react";
import * as mui from "@mui/material";

function TasksTab() {
  return (
    <mui.Box sx={{ width: "100%" }}>
      <mui.Stack spacing={2}>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Add Task
          </mui.Typography>
          <mui.TextField
            name="addtask"
            // value={addtask}
            // onChange={handleChange}
            // optional
            sx={{ bgcolor: "#264139", borderRadius: "10px" }}
          />
        </mui.Stack>
      </mui.Stack>
    </mui.Box>
  );
}

export default TasksTab;
