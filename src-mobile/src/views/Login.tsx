import { Box, Button, TextField, Typography } from "@mui/material";
import bgLogin from "../assets/sign-up-bg.png";
import { mobile_session_and_local_auth } from "services/auth";

import { session_and_local_auth } from "../../../src/services/authentication/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    session_and_local_auth(password)
      .then((res) => {
        console.log("Login Successful", res);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.log("Error in Login", err);
        setIsLoading(false);
      });
  };

  return (
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

        <TextField
          fullWidth
          sx={{ border: "1px solid #00FFAA", borderRadius: "10px" }}
          placeholder='Password'
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
        />
        <Box sx={{ width: "100%" }}>
          <Typography fontSize='18px' color='#0cd48f'>
            Can’t access <span style={{ color: "#9f9f9f" }}>your account?</span>
          </Typography>
          <Typography
            component={Link}
            to='/username'
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
  );
}

export default Login;
