import img from "../assets/more-protection.png";
import { Box, Button, Typography } from "@mui/material";

const MoreProtection = () => {
  return (
    <Box
      height='100vh'
      position='relative'
      sx={{ backgroundImage: `url(${img})`, backgroundSize: "cover" }}
    >
      <Typography
        marginTop='10vh'
        mx='auto'
        width='100%'
        color='#fff'
        textAlign='center'
        fontSize='60px'
        px={3}
        fontWeight={700}
        lineHeight='63px'
      >
        Use more
        <span style={{ color: "#00FFAA" }}> Protection</span>
      </Typography>
      <Typography
        p={2}
        lineHeight='20.88px'
        fontSize='18px'
        color='#A7A7A7'
        mx='auto'
        width='90%'
        textAlign='center'
      >
        Add face Id for logging into your account and sending transactions
      </Typography>

      <Box
        width='100%'
        position='absolute'
        p={2}
        left={0}
        bottom={0}
        height='auto'
        zIndex={10}
        pb={5}
      >
        <Button
          fullWidth
          sx={{
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
            py: 2,
          }}
          variant='contained'
          type='submit'
        >
          Enable
        </Button>
        <Button
          sx={{ mt: 3, bgcolor: "#3E3E3E", color: "#fff", border: "0px" }}
          fullWidth
        >
          Ask me later
        </Button>
      </Box>
    </Box>
  );
};

export default MoreProtection;
