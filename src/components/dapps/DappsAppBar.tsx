import * as React from "react";
import { Typography } from "@mui/material";

interface DappsAppBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DappsAppBar: React.FC<DappsAppBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <>
      <Typography
        color="#ffffff"
        borderBottom={activeTab === "explore" ? "1px solid #FFFFFF" : ""}
        sx={{
          position: "absolute",
          left: "5%",
          top: "10%",
          fontWeight: activeTab === "explore" ? "bold" : "normal",
          mb: "10px",
          cursor: "pointer", // Add cursor pointer
        }}
        onClick={() => onTabChange("explore")}
      >
        Explore
      </Typography>
      <Typography
        color="#ffffff"
        borderBottom={activeTab === "connected" ? "1px solid #FFFFFF" : ""}
        sx={{
          position: "absolute",
          left: "23%",
          top: "10%",
          fontWeight: activeTab === "connected" ? "bold" : "normal",
          mb: "10px",
          cursor: "pointer", // Add cursor pointer
        }}
        onClick={() => onTabChange("connected")}
      >
        Connected
      </Typography>
    </>
  );
};

export default DappsAppBar;