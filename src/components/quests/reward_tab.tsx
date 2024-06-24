import React from "react";
import * as mui from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

function RewardTab() {
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
            sx={{ bgcolor: "#264139", borderRadius: "10px" }}
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
            sx={{ bgcolor: "#264139", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <InputLabel id="demo-simple-select-helper-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            // value={age}
            // label="Age"
            // onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          
        </mui.Stack>
      </mui.Stack>
    </mui.Box>
  );
}

export default RewardTab;
