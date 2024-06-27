/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/indent */
import * as React from "react";
import * as mui from "@mui/material";
import AddTasks from "./TaskQuests/AddTasks";

import {
  ContextProvider,
  useQuestContext,
} from "../../../views-desktop/quests/CreateTask";

const TasksQuests: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}: {
  handleNext: () => void;
}) => {
  const { formField, setFormField } = useQuestContext();
  return (
    <ContextProvider>
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          position: "relative",
        }}
      >
        <AddTasks
          setFormField={setFormField}
          handleNext={handleNext}
          formField={formField}
        />
      </mui.Box>
    </ContextProvider>
  );
};

export default TasksQuests;
