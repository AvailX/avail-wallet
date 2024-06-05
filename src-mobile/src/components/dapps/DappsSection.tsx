import React from "react";
import { Box, Typography } from "@mui/material";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import { Dapp } from "src/assets/dapps/dapps";

interface DappsSectionProps {
  title: string;
  dapp: Dapp;
}

const DappsSection: React.FC<DappsSectionProps> = ({ title, dapp }) => {
  return (
    <Box
      sx={{
        height: "52px",
        display: "flex",
        justifyContent: "space-between",
        mt: "10px",
        mb: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mr: "7px",
          flex: 15,
        }}
      >
        {/*Image */}
        <Box
          sx={{
            justifyContent: "center",
            alignItems: "center",
            width: "33px",
            minWidth: "33px",
            maxWidth: "33px",
            height: "33px",
            maxHeight: "33px",
            minHeight: "33px",
            borderRadius: "5px",
            overflow: "hidden",
            backgroundColor: "#000000",
            marginRight: "7px",
          }}
        >
          <img
            src={dapp.img}
            alt="Connected Dapp"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center"
            }}
          />
        </Box>
        {/* Text */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            right: "unset",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontSize: "15px", fontWeight: "normal" }}
            >
              {dapp.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "11px", ml: "8px", color: "lightgray" }}
            >
              {`[${dapp.tags}]`}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: "10px",
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              maxWidth: "100%",
            }}
          >
            {dapp.description}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          marginRight: "19px",
          flex: 1,
        }}
      >
        <NavigateNextOutlinedIcon></NavigateNextOutlinedIcon>
      </Box>
    </Box>
  );
};

export default DappsSection;
