import React from "react";
import { Box, Typography } from "@mui/material";
import { Dapp } from "../../types/dapps/types";

import { useNavigate } from "react-router-dom";

interface DappsGridView {
  dapps: Dapp[];
  activeTab: string;
}

const ConnectedDappsGrid: React.FC<DappsGridView> = ({ dapps, activeTab }) => {
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
        dapps.map((dapp, index) => (
          <Box
            key={index}
            onClick={() => {
              const navigate = useNavigate();
              navigate("browser", { state: dapp.url });
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
                src={dapp.main_img}
                alt="Connected Dapp"
                style={{ width: "100%", height: "auto" }} // Ensure image fits inside box
              />
            </Box>
            <Typography sx={{ color: "#B0B0B0", fontSize: "11px" }}>
              {dapp.name}
            </Typography>
          </Box>
        ))}
    </Box>
  );
};

export default ConnectedDappsGrid;