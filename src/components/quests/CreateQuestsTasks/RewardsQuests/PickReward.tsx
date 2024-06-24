import * as React from "react";
import * as mui from "@mui/material";
import img1 from "../../../../assets/images/img1.png";

const PickReward: React.FC = () => {
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
        Pick a reward!
      </mui.Typography>

      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          mt: 3,
        }}
      >
        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%", // Adjust width as needed
            backgroundColor: "#2A2C2B",
            borderRadius: "10px",
            p: 2,
            mr: 2,
            maxHeight: "75%",
            maxWidth: "50%",
          }}
        >
          <mui.Box
            component="img"
            src={img1}
            alt="Reward Method"
            sx={{
              width: "100%",
              height: "auto",
              mb: 2,
              borderRadius: "5px",
            }}
          />
          <mui.Typography variant="h6" color={"#00FFAA"}>
            Avail Points
          </mui.Typography>
        </mui.Box>

        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%", // Adjust width as needed
            backgroundColor: "#2A2C2B",
            borderRadius: "10px",
            p: 2,
            ml: 2,
            maxHeight: "75%",
            maxWidth: "50%",
          }}
        >
          <mui.Box
            component="img"
            src={img1}
            alt="Reward Method"
            sx={{
              width: "100%",
              height: "auto",
              mb: 2,
              borderRadius: "5px",
            }}
          />
          <mui.Typography variant="h6" color={"#00FFAA"}>
            NFTs
          </mui.Typography>
        </mui.Box>
      </mui.Box>
    </mui.Box>
  );
};

export default PickReward;
