import * as React from "react";
import * as mui from "@mui/material";
import logo from "../assets/logos/avail-black-icon.svg";
import { useNavigate } from "react-router-dom";

function EntryPoint() {
  const navigate = useNavigate();
  React.useEffect(() => {
    setTimeout(() => {
      //   navigate("/dashboard");
      // commenting to test the wallet connect
      navigate("/wallet-connect");
    }, 2000);
  }, []);
  return (
    <mui.Box
      sx={{
        display: "flex",
        alignItems: "center",
        alignContent: "center",
        height: "100vh",
        justifyContent: "center",
        bgcolor: "#00FFAA",
        width: "100vw",
        overflow: "hidden",
        m: 0,
        p: 0,
      }}
    >
      <img src={logo} style={{ width: "30%", alignSelf: "center" }} />
    </mui.Box>
  );
}

export default EntryPoint;
