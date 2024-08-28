import React from "react";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

const GlowingArrowIcon = styled(ArrowDownwardRoundedIcon)({
  fontSize: "60px", // Adjust size as needed
  color: "#6E05FC", // Arrow color
  filter: "drop-shadow(0px 0px 4px #7005FCCE)", // Glow effect
  animation: "glow 1.5s infinite alternate", // Optional animation
  "@keyframes glow": {
    "0%": {
      textShadow:
        "0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)",
    },
    "100%": {
      textShadow:
        "0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 0.5)",
    },
  },
});

const SendButton = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
      <GlowingArrowIcon />
    </Box>
  );
};

export default SendButton;
