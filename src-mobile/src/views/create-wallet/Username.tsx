import { Box, Button, TextField } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Username = () => {
  const navigate = useNavigate();
  return (
    <Box display='flex' height='100vh' flexDirection='column' pt={10}>
      <TextField placeholder='username.avl.alo' />

      <Button onClick={() => navigate("/password")}>Own it</Button>
      <Button>Maybe later</Button>
    </Box>
  );
};

export default Username;
