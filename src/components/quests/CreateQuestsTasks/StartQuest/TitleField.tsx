import * as React from "react";
import * as mui from "@mui/material";

const TitleField: React.FC = () => {
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
        Title
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
        <mui.TextField
          fullWidth // Make TextField take full width of its container
          label="Create a title"
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
              color: "#00FFAA", // Change label text color
              ml: "10px",
            },
          }}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default TitleField;
