import * as React from "react";
import * as mui from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useQuestContext } from "../../../../views-desktop/quests/CreateTask";

const DescribeField: React.FC = () => {
  const { register } = useFormContext();

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
        Description
      </mui.Typography>
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "200px",
          width: "100%",
          // backgroundColor: "#2A2C2B",
          // border: "none",
          borderRadius: "15px",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        <mui.TextField
          fullWidth
          multiline
          rows={8}
          placeholder='Describe Your Quest Here'
          sx={{ mt: 1 }}
          // variant='standard'
          {...register("describeQuest")}
          // value={formField.describeQuest || ""}
          // onChange={handleChange}
          InputProps={{
            sx: {
              color: "#00FFAA",
              "& .MuiInput-underline:before": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:after": {
                borderBottom: "none",
              },
            },
            disableUnderline: true,
          }}
          InputLabelProps={{
            sx: {
              color: "#00FFAA",
              marginBottom: "5px",
              ml: "10px",
            },
          }}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default DescribeField;
