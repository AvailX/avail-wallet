import * as React from "react";
import { Box, Typography } from "@mui/material";
import img from "../../assets/connected-dapp.svg";
// import { type Dapp } from '../../types/dapps/types';
import { Dapp } from "src/assets/dapps/dapps";

import { useNavigate } from "react-router-dom";
import { PropTypes } from "@mui/material";

type HorizontalScrollContainerProps = {
  dapp: Dapp; // Define a prop 'dapp' of type 'Dapp'
};

const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  dapp,
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/browser", { state: dapp.url });
  };

  return (
    <Box
      sx={{
        position: "relative", // Set position to relative
        width: "340px",
        height: "165px",
        overflowX: "auto", // Enable horizontal scrolling
        background:
          "linear-gradient(to right, #0038FF 0%,  #000000 50%, #0038FF 100%)",
        padding: "10px",
        borderRadius: "22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end", // Align content to the bottom
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: "50px",
        }}
      >
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
              objectPosition: "center",
            }}
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            height: "30%",
            maxHeight: "40%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            right: "unset",
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontSize: "15px", fontWeight: "normal" }}
          >
            {dapp.name} {/* Use the 'name' property of the 'dapp' prop */}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: "10px",
              fontWeight: "normal",
              textAlign: "left",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {dapp.description}{" "}
            {/* Use the 'description' property of the 'dapp' prop */}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HorizontalScrollContainer;
