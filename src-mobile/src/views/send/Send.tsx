import { Box, InputAdornment, TextField, Typography } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CropFreeIcon from "@mui/icons-material/CropFree";

import DashboardLayout from "../../layouts/DashboardLayout";
import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

function Send() {
  const [address, setAddress] = useState<string>("");
  const navigate = useNavigate();

  const handleEnterPress = () => {
    console.log("Enter key pressed! Address:", address);
    navigate("/input-send", { state: { address } });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEnterPress();
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography
          color='#00FFAA'
          textAlign='center'
          fontSize='25px'
          fontWeight={700}
        >
          Send
        </Typography>

        <TextField
          fullWidth
          placeholder='Search avail user or aleo address '
          variant='standard'
          onChange={(e) => setAddress(e?.target?.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment sx={{ fontSize: "40px" }} position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <CropFreeIcon sx={{ fontSize: "40px" }} />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
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
            "& > .MuiInputBase-root": {
              bgcolor: "#264139",
              px: 2,
              py: 1,
              borderRadius: "9px",
            },
            "&::placeholder": {
              color: "red",
            },
            mt: 4,
          }}
        />
      </Box>
    </DashboardLayout>
  );
}

export default Send;
