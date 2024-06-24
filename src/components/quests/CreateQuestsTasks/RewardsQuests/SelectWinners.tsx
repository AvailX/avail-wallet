import * as React from "react";
import * as mui from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const SelectWinners: React.FC = () => {
  return (
    <mui.Box sx={{ width: "100%" }}>
      <mui.Stack spacing={2}>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Reward Collection Name
          </mui.Typography>
          <mui.TextField
            name="Reward collection Name"
            // value={rewardName}
            // onChange={handleChange}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Reward Amount
          </mui.Typography>
          <mui.TextField
            name="username"
            // value={username}
            // onChange={handleChange}
            // optional
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <InputLabel
            id="demo-simple-select-helper-label"
            sx={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
            }}
          >
            Mechanism
          </InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            // value={age}
            // label="Age"
            // onChange={handleChange}
            sx={{
              bgcolor: "#2A2C2B",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
            }}
            // sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={10}>FCFS</MenuItem>
            <MenuItem value={20}>Leaderboard</MenuItem>
            <MenuItem value={30}>LuckyDraw</MenuItem>
          </Select>
        </mui.Stack>
        <mui.Stack direction="row" spacing={1}>
          <mui.TextField
            fullWidth
            label="Expires On"
            type="date"
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
          {/* to be automated */}
          <mui.TextField
            fullWidth
            label="created On"
            type="date"
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            // sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
            sx={{
              bgcolor: "#2A2C2B",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
            }}
          />
        </mui.Stack>

        <mui.Stack direction="column" spacing={0}>
          <mui.TextField
            label="Campiagn ID"
            disabled
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
        </mui.Stack>
      </mui.Stack>
      <mui.Button sx={{ color: "fff" }}>Launch</mui.Button>
    </mui.Box>
  );
};

export default SelectWinners;
