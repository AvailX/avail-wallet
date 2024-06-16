import React from "react";
import * as mui from "@mui/material";

function RewardTab() {
  return (
    <mui.Box sx={{ width: "100%" }}>
      <mui.Stack spacing={2}>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Pick a Reward
          </mui.Typography>
          <mui.TextField
            name="username"
            value={username}
            onChange={handleChange}
            optional
            sx={{ bgcolor: "#264139", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            How many winners?
          </mui.Typography>
          <mui.TextField
            name="username"
            value={username}
            onChange={handleChange}
            optional
            sx={{ bgcolor: "#264139", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Allocation
          </mui.Typography>
          <mui.TextField
            name="username"
            value={username}
            onChange={handleChange}
            optional
            sx={{
              bgcolor: "#264139",
              borderRadius: "10px",
              border: "1px dashed grey",
            }}
          />
        </mui.Stack>
      </mui.Stack>
    </mui.Box>
  );
}

export default RewardTab;
