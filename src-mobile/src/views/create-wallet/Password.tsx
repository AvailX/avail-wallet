import { Box, Button, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { registerSeedPhrase } from "../../services/auth";
import { register_seed_phrase } from "../../../src/services/authentication/register";
import { Languages } from "../../../../src/types/languages";

const Password = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const clickStuff = async () => {
    register_seed_phrase(
      setError,
      setMessage,
      "Nyerishi",
      "12353",
      false,
      Languages.English,
      12
    )
      .then((r) => {
        console.log("response xxx", r);
      })
      .catch((e) => {
        console.log("Error xxx", e);
      });
  };

  return (
    <Box display='flex' height='100vh' flexDirection='column' pt={10}>
      <TextField placeholder='password' />
      <TextField placeholder='confirm password' />

      <Button
        onClick={() => {
          clickStuff();
          //navigate("/backup-wallet");
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export default Password;
