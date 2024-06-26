import * as React from "react";
import * as mui from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";

const Allocation: React.FC = () => {
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
        Allocation
      </mui.Typography>
      <Controller
        name='allocation'
        control={control}
        render={({ field }) => (
          <>
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
                mb: "10px",
              }}
            >
              <mui.TextField
                fullWidth
                label='Lucky draw'
                variant='standard'
                {...field}
                onChange={() => field.onChange("Lucky draw")}
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
            </mui.Box>

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
                mb: "10px",
              }}
            >
              <mui.TextField
                fullWidth
                label='FCFS(First Come, First Served)'
                variant='standard'
                {...field}
                onChange={() => field.onChange("FCFS")}
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
            </mui.Box>
          </>
        )}
      />
      <mui.Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0D3C2C",
          borderRadius: "10px",
          width: "30%",
          height: "20px",
          alignSelf: "center",
          p: 2,
        }}
      >
        <mui.Typography variant='body1' color='#00FFAA'>
          Launch
        </mui.Typography>
      </mui.Box>
    </mui.Box>
  );
};

export default Allocation;
