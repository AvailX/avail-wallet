import React from "react";
import { Box, Typography } from "@mui/material";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import { Campaign } from "../../../types/quests/quest_types";

interface DappsSectionProps {
  campaign: Campaign[];
}

const QuestsSection: React.FC<DappsSectionProps> = ({  campaign }) => {
  return (
    <Box
      sx={{
        height: "40px",
        display: "flex",
        justifyContent: "space-between", // Align items with space between
        mt: "10px", // Add margin top
        mb: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mr: "7px", // Add margin right
        }}
      >
        {/*Image */}
        <Box
          sx={{
            justifyContent: "center",
            alignItems: "center",
            width: "33px",
            height: "33px",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#000000",
            marginRight: "7px",
          }}
        >
          <img
            src={campaign[0].box_image}
            alt="Connected Dapp"
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
        {/* Text */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontSize: "17px", fontWeight: "normal" }}
          >
            {campaign[0].title}
            {/* Use the 'name' property of the 'dapp' prop */}
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "10px", fontWeight: "normal" }}
          >
            {campaign[0].subtitle}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          marginRight: "19px",
        }}
      >
        <NavigateNextOutlinedIcon></NavigateNextOutlinedIcon>
      </Box>
    </Box>
  );
};

export default QuestsSection;
 