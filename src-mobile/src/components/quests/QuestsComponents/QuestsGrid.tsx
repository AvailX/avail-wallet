import React from "react";
import { Box, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { Campaign } from "../../../../../src/types/quests/quest_types";

interface QuestsGridView {
  campaigns: Campaign[];
  activeTab: string;
}

const ConnectedQuestsGrid: React.FC<QuestsGridView> = ({
  campaigns,
  activeTab,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      {activeTab === "connected" &&
        campaigns.map((campaign, index) => (
          <Box
            key={index}
            onClick={() => {
              //   const navigate = useNavigate();
              //   navigate("browser", { state: campaign.url? });
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "81px",
              height: "105px",
              backgroundColor: "#000000",
              borderRadius: "10px",
              margin: "5px", // Adjust margin between boxes
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "81px",
                height: "81px",
                borderRadius: "10px",
                overflow: "hidden", // Ensure image does not exceed box size
              }}
            >
              <img
                src={campaign.profile_image}
                alt="Connected Dapp"
                style={{ width: "100%", height: "auto" }} // Ensure image fits inside box
              />
            </Box>
            <Typography sx={{ color: "#B0B0B0", fontSize: "11px" }}>
              {campaign.title}
            </Typography>
          </Box>
        ))}
    </Box>
  );
};

export default ConnectedQuestsGrid;
