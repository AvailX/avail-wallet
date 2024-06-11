import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

const Username = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <Box display='flex' height='100vh' flexDirection='column' pt={10}>
        <Typography textAlign='left' mb={2} fontWeight={700} fontSize='25px'>
          Select your{" "}
          <span style={{ color: "#05e69a" }}>Username & Password</span>
        </Typography>
        <TextField
          placeholder='username.avl.alo'
          inputProps={{
            sx: {
              "&::placeholder": {
                color: "#676767",
                opacity: 1,
              },
              color: "#fff",
            },
          }}
          sx={{
            color: "#fff",
            border: "1px solid #00FFAA",
            my: 2,
            borderRadius: "8px",
          }}
        />
        <TextField
          placeholder='Password'
          inputProps={{
            sx: {
              "&::placeholder": {
                color: "#676767",
                opacity: 1,
              },
              color: "#fff",
            },
          }}
          sx={{
            my: 2,
            color: "#fff",
            border: "1px solid #00FFAA",
            borderRadius: "8px",
          }}
        />
        <TextField
          placeholder='Confirm Password'
          inputProps={{
            sx: {
              "&::placeholder": {
                color: "#676767",
                opacity: 1,
              },
              color: "#fff",
            },
          }}
          sx={{
            my: 2,
            color: "#fff",
            border: "1px solid #00FFAA",
            borderRadius: "8px",
          }}
        />

        <Button
          sx={{ mt: 4, mb: 2, py: 2 }}
          onClick={() => navigate("/backup-wallet")}
        >
          Continue
        </Button>
        {/* <Button>Maybe later</Button> */}
      </Box>
    </AuthLayout>
  );
};

export default Username;
