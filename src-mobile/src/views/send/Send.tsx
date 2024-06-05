import {
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CropFreeIcon from "@mui/icons-material/CropFree";

import DashboardLayout from "../../layouts/DashboardLayout";

function Send() {
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

        {/* <OutlinedInput
          placeholder='@Username'
          size='small'
          aria-label=''
          sx={{
            color: "white",
            bgcolor: "#293343",
            borderRadius: 10,
            height: "40px",
            pl: 4,
            width: "100%",
          }}
          fullWidth
          endAdornment={
            <InputAdornment position='end'>
              <IconButton edge='end'>
                <SearchIcon sx={{ color: "#fff", pr: 1 }} />
              </IconButton>
            </InputAdornment>
          }
          color='info'
        /> */}

        <TextField
          fullWidth
          placeholder='Search avail user or aleo address '
          variant='standard'
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
