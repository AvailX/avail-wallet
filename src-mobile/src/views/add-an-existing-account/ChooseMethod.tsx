import * as React from 'react';
import * as mui from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

function ChooseMethod() {
  const navigate = useNavigate();

  return (
    <mui.Box
      className="Box"
      height="100vh"
      position="relative"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundSize: "cover",
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

      <mui.Typography mt={10} fontSize={25} sx={{ color: "#fff" }}>
        Are you an
        <span style={{ color: "#01f0a0" }}> Avail</span> user?
      </mui.Typography>
      <mui.Typography variant="h6" sx={{ color: "#9d9d9d" }}>
        You have been missed
      </mui.Typography>

      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "calc(100vh - 150px)",
          mt: 4,
        }}
      >
        {/* This is the Yes button */}
        <mui.Box sx={{ padding: "0px 10px" }}>
          <mui.Button
            fullWidth
            onClick={() => navigate("/seed-phrase-login")}
            size="large"
            sx={{ fontSize: "1rem", padding: "12px 90px", mt: 10 }}
          >
            Yes
          </mui.Button>
          <mui.Typography fontSize={18} sx={{ color: "#9d9d9d" }}>
            If you already have an Avail account, click yes.
          </mui.Typography>
        </mui.Box>

        {/* The No button */}
        <mui.Box sx={{ padding: "0px 10px" }}>
          <mui.Button
            variant="outlined"
            fullWidth
            color="success"
            size="large"
            onClick={() => navigate("/private-key-login")}
            sx={{
              fontSize: "1rem",
              padding: "12px 90px",
              border: "1px solid #01f0a0",
              color: "#01f0a0",
            }}
          >
            No
          </mui.Button>
          <mui.Typography fontSize={18} sx={{ color: "#9d9d9d" }}>
            If you have another wallet on Aleo and would like to import it,
            click No.
          </mui.Typography>
        </mui.Box>

        {/* The Next button */}
        <mui.Box mb={5}>
          <mui.Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate("/next-page")}
            sx={{
              fontSize: "1rem",
              padding: "12px 165px",
              background:
                "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
            }}
          >
            Next
          </mui.Button>
        </mui.Box>
      </mui.Box>
    </mui.Box>
  );
}

export default ChooseMethod;