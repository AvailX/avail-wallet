import * as React from "react";
import * as mui from "@mui/material";

const DescribeField: React.FC = () => {
  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        mb: "5%",
      }}
    >
      <mui.Typography variant="h4" color={"white"} fontWeight={"bold"}>
        Description
      </mui.Typography>
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "200px",
          width: "100%",
          backgroundColor: "#2A2C2B",
          border: "none",
          borderRadius: "15px",
          alignItems: "stretch", // Align items to stretch vertically
          justifyContent: "flex-start", // Align content to start at the top
        }}
      >
        <mui.TextField
          fullWidth
          multiline // Allow multiline input
          rows={8} // Specify number of rows to show initially
          label="Describe Your Quest Here"
          variant="standard"
          InputProps={{
            sx: {
              ml: "10px",
              color: "#00FFAA",
              "& .MuiInput-underline:before": {
                borderBottom: "none", // Remove default underline
              },
              "& .MuiInput-underline:hover:before": {
                borderBottom: "none", // Remove underline on hover
              },
              "& .MuiInput-underline:after": {
                borderBottom: "none", // Remove underline after interaction
              },
            },
            disableUnderline: true, // Alternative way to disable underline
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
