import { Box, Button, Input, TextField, Typography } from "@mui/material";

import { session_and_local_auth } from "../../../src/services/authentication/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import NewAccountDialog from "../components/dialogs/NewAccount";

import bgLogin from "../assets/sign-up-bg.png";

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);

  const handleLogin = async () => {
    setIsLoading(true);
    session_and_local_auth(password)
      .then((res) => {
        console.log("Login Successful", res);
        setIsLoading(false);
        navigate("/dashboard");
      })
      .catch((err: any) => {
        console.log("Error in Login", err);
        setIsLoading(false);
      });
  };

  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <NewAccountDialog
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
        }}
      />
      <Box
        height='100vh'
        py={10}
        px={2}
        sx={{ background: `url(${bgLogin})`, backgroundSize: "cover" }}
      >
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='space-between'
          height='100%'
        >
          <Typography
            textAlign='center'
            fontWeight={700}
            fontSize='25px'
            color='#fff'
          >
            <span style={{ color: "#00FFAA" }}>Welcome</span> back
          </Typography>

          <Input
            fullWidth
            sx={{ border: "1px solid #00FFAA", borderRadius: "10px", p: 2 }}
            disableUnderline
            placeholder='Password'
            type={passwordHidden ? "password" : "text"}
            value={password}
            onChange={(e) => setPassword(e?.target?.value)}
            inputProps={{
              sx: {
                "&::placeholder": {
                  color: "#676767",
                  opacity: 1,
                },
                color: "#fff",
              },
            }}
            endAdornment={
              passwordHidden ? (
                <VisibilityOffIcon
                  style={{ color: "#FFF", cursor: "pointer" }}
                  onClick={() => {
                    setPasswordHidden(false);
                  }}
                />
              ) : (
                <VisibilityIcon
                  style={{ color: "#FFF" }}
                  onClick={() => {
                    setPasswordHidden(true);
                  }}
                />
              )
            }
          />

          <Box sx={{ width: "100%" }}>
            <Typography fontSize='18px' color='#0cd48f'>
              Can’t access{" "}
              <span style={{ color: "#9f9f9f" }}>your account?</span>
            </Typography>
            <Typography
              onClick={() => setOpenDialog(true)}
              fontSize='18px'
              color='#0cd48f'
              sx={{ textDecoration: "none" }}
            >
              Create new account?
            </Typography>
            <Button
              onClick={handleLogin}
              sx={{
                mt: 3,
                width: "100%",
                bgcolor: "#50505091",
                border: "0px solid ",
                color: "#00FFAA",
                py: 2,
                fontSize: "20px",
                "&:focused": {
                  bgcolor: "inherit",
                },
              }}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Login;
