import { Box, Input as TextField, Typography } from "@mui/material";

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
          onChange={(e) => setAddress(e?.target?.value)}
          onKeyDown={handleKeyDown}
          startAdornment={<SearchIcon sx={{ color: "#fff", mr: 2 }} />}
          endAdornment={<CropFreeIcon sx={{ color: "#fff", mr: 2 }} />}
          disableUnderline
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
            border: "1px solid #00FFAA",
            borderRadius: "10px",
            p: 2,
            mt: 4,
          }}
        />
      </Box>
    </DashboardLayout>
  );
}

export default Send;
