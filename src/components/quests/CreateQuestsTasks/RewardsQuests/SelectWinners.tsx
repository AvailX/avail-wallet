import * as React from "react";
import * as mui from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";

const SelectWinners: React.FC = () => {
  const { control } = useFormContext();

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
        How many winners?
      </mui.Typography>
      <mui.Box
        sx={{
          display: "flex",
          height: "50px",
          width: "100%",
          backgroundColor: "#2A2C2B",
          border: "none",
          borderRadius: "15px",
          alignItems: "center",
          fontSize: "12px",
          justifyContent: "center",
        }}
      >
        <Controller
          name='winners'
          control={control}
          render={({ field }) => (
            <mui.TextField
              fullWidth
              label='Number of winners'
              variant='standard'
              {...field}
              InputProps={{
                sx: {
                  ml: "10px",
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
                  ml: "10px",
                },
              }}
            />
          )}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default SelectWinners;
