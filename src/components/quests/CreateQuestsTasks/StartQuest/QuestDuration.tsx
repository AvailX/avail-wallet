import * as React from "react";
import * as mui from "@mui/material";

const QuestDuration: React.FC = () => {
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
        Duration
      </mui.Typography>

      {/* Row 1 -- Start Row */}
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          mt: 2,
        }}
      >
        <mui.Typography variant="h6" color={"#00FFAA"} sx={{ mr: 2 }}>
          Start
        </mui.Typography>
        <mui.TextField
          label="Start Immediately"
          type="date"
          variant="outlined"
          sx={{
            input: { color: "#00FFAA" },
            label: { color: "#00FFAA" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#00FFAA",
              },
              "&:hover fieldset": {
                borderColor: "#00FFAA",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00FFAA",
              },
            },
            mr: 2,
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <mui.TextField
          label="Choose a Time"
          type="time"
          variant="outlined"
          sx={{
            input: { color: "#00FFAA" },
            label: { color: "#00FFAA" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#00FFAA",
              },
              "&:hover fieldset": {
                borderColor: "#00FFAA",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00FFAA",
              },
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </mui.Box>

      {/* Row 2 */}
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          mt: 2,
        }}
      >
        <mui.Typography variant="h6" color={"#00FFAA"} sx={{ mr: 2 }}>
          End
        </mui.Typography>
        <mui.TextField
          label="End Date"
          type="date"
          variant="outlined"
          sx={{
            input: { color: "#00FFAA" },
            label: { color: "#00FFAA" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#00FFAA",
              },
              "&:hover fieldset": {
                borderColor: "#00FFAA",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00FFAA",
              },
            },
            mr: 2,
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <mui.TextField
          label="End Time"
          type="time"
          variant="outlined"
          sx={{
            input: { color: "#00FFAA" },
            label: { color: "#00FFAA" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#00FFAA",
              },
              "&:hover fieldset": {
                borderColor: "#00FFAA",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00FFAA",
              },
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </mui.Box>
    </mui.Box>
  );
};

export default QuestDuration;
