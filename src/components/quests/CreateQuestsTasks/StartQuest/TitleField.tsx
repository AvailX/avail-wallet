import * as React from "react";
import * as mui from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useQuestContext } from "../../../../views-desktop/quests/CreateTask";

const TitleField: React.FC = () => {
  const { register } = useFormContext();
  // const { formField, setFormField } = useQuestContext();

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormField({ ...formField, taskTitle: e.target.value });
  // };

  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        mb: "5%",
      }}
    >
      <mui.Typography variant='h4' color={"white"} fontWeight={"bold"}>
        Title
      </mui.Typography>
      <mui.Box
        sx={{
          display: "flex",
          height: "50px",
          width: "100%",
          // backgroundColor: "#2A2C2B",
          border: "none",
          borderRadius: "15px",
          alignItems: "center",
          fontSize: "12px",
          justifyContent: "center",
        }}
      >
        <mui.TextField
          fullWidth
          placeholder='Create a title'
          sx={{ mt: 1 }}
          // variant='standard'
          {...register("taskTitle")}
          // value={formField.taskTitle || ""}
          // onChange={handleChange}
          InputProps={{
            sx: {
              color: "#00FFAA",
              "& .MuiInput-underline:before": {
                // borderBottom: "none",
              },
              "& .MuiInput-underline:hover:before": {
                // borderBottom: "none",
              },
              "& .MuiInput-underline:after": {
                // borderBottom: "none",
              },
            },
            disableUnderline: true,
          }}
          InputLabelProps={{
            sx: {
              color: "#00FFAA",
              ml: "10px",
            },
          }}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default TitleField;
