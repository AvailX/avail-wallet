import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";

const GoBack = () => {
  const navigate = useNavigate();
  return (
    <Box display='flex' alignItems='center' justifyContent='flex-start'>
      <IconButton
        onClick={() => {
          navigate(-1);
        }}
      >
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          bgcolor='#393939'
          width='35px'
          height='35px'
          borderRadius='50%'
          p={3}
        >
          <ArrowBackIosNewIcon sx={{ color: "#BDBDBD" }} />
        </Box>
      </IconButton>
    </Box>
  );
};

export default GoBack;
