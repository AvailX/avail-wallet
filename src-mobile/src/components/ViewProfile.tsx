import { Box, Button, Typography } from "@mui/material";
import avatarImg from "../assets/avatar-img.svg";

const ViewProfile = () => {
  return (
    <Box bgcolor='#111111' px={2} py={1} borderRadius='21px'>
      <Box display='flex' alignItems='center'>
        <img src={avatarImg} />
        <Box ml={3}>
          <Typography fontWeight={700} color='#fff'>
            aleo1ab3j...82k
          </Typography>
          <Typography color='#fff'>$662.27</Typography>
        </Box>
      </Box>
      <Button
        fullWidth
        sx={{
          bgcolor: "#2A3331",
          border: "0px",
          color: "#fff",
          my: 2,
          borderRadius: "20px",
        }}
      >
        View profile
      </Button>
    </Box>
  );
};

export default ViewProfile;
