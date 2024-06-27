import * as React from "react";
import { useState } from "react";
import * as mui from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const SelectWinners: React.FC = () => {
  // campaignID for test
  const campaignId = 12345;

  const [rewardName, setRewardName] = useState("");
  const [username, setUsername] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [createdOn, setCreatedOn] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [campaignIdState, setCampaignIdState] = useState(campaignId.toString());

  const handleLaunch = () => {
    console.log("Reward Collection Name:", rewardName);
    console.log("Reward Amount:", username);
    console.log("Mechanism:", mechanism);
    console.log("Expires On:", expiresOn);
    console.log("Created On:", createdOn);
  };

  return (
    <mui.Box sx={{ width: "100%" }}>
      <mui.Stack spacing={2}>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Reward Collection Name
          </mui.Typography>
          <mui.TextField
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
        </mui.Stack>
        <mui.Stack direction="column" spacing={0}>
          <mui.Typography color="#fff" fontSize="15px" fontWeight={200}>
            Reward Amount
          </mui.Typography>
          <mui.TextField
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={mechanism}
            onChange={(e) => setMechanism(e.target.value)}
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
            <MenuItem value={1}>FCFS</MenuItem>
            <MenuItem value={2}>Leaderboard</MenuItem>
            <MenuItem value={3}>LuckyDraw</MenuItem>
          </Select>
        </mui.Stack>
        <mui.Stack direction="row" spacing={1}>
          <mui.TextField
            fullWidth
            label="Expires On"
            type="date"
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
          {/* to be automated */}
          {/* <mui.TextField
            fullWidth
            label="created On"
            type="date"
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            value={createdOn}
            disabled
            sx={{
              bgcolor: "#2A2C2B",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
            }}
          /> */}
        </mui.Stack>

        {/* <mui.Stack direction="column" spacing={0}>
          <mui.TextField
            label="Campiagn ID"
            disabled
            value={campaignIdState}
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
          />
        </mui.Stack> */}
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
          <mui.Typography
            variant="body1"
            color="#00FFAA"
            onClick={handleLaunch}
          >
            Launch
          </mui.Typography>
        </mui.Box>
      </mui.Stack>
    </mui.Box>
  );
};

export default SelectWinners;
