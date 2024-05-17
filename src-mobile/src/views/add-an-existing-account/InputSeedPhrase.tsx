import * as React from 'react';
import * as mui from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import WalletInput from "../../components/texfields/AvailTextField";

function Recover() {
  const navigate = useNavigate();
  return (
    <mui.Grid
      container
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        backgroundSize: "cover",
        backgroundColor: "#000000",
      }}
    >
      {/* Arrow back icon */}
      <mui.IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: "50px",
          left: "10px",
          color: "lightgray",
          zIndex: "1000",
          pl: 2,
          width: "40px", // Adjust width and height to set the size of the circular container
          height: "40px",
          borderRadius: "50%", // Setting borderRadius to 50% makes the container a circle
          backgroundColor: "gray", // You can adjust the background color as needed
          display: "flex", // Use flexbox to center the icon horizontally and vertically
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
        }}
      >
        <ArrowBackIos />
      </mui.IconButton>

      <mui.Box
        position="relative"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/*The Text in Column */}
        <mui.Typography
          mt={10}
          fontSize={25}
          fontWeight={"bold"}
          sx={{ color: "#fff" }}
        >
          Input your
          <span style={{ color: "#01f0a0" }}> Seed Phrase</span>
        </mui.Typography>
        <mui.Typography
          fontSize={18}
          fontWeight={"regular"}
          sx={{ color: "#9d9d9d" }}
        >
          You have been missed
        </mui.Typography>
      </mui.Box>

      <WalletInput isPassword={false}/>

      {/* The Next button */}
      <mui.Grid item xs={12} textAlign="center" mt={10}>
        <mui.Button
          variant="contained"
          size="large"
          onClick={() => {}}
          sx={{
            fontSize: "20px",
            padding: "12px 140px",
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
          }}
        >
          Next
        </mui.Button>
      </mui.Grid>
    </mui.Grid>
  );
}

export default Recover;