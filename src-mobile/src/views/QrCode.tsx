import DashboardLayout from "../layouts/DashboardLayout";

import scanQr from "../assets/scan-qr.png";
import { Box, Typography } from "@mui/material";

function QrCode() {
  return (
    <DashboardLayout>
      <Box position='relative'>
        <Typography
          fontSize='25px'
          position='absolute'
          sx={{ width: "100%" }}
          top='10vh'
          color='#B6B6B6'
          fontWeight={500}
        >
          Scan a QR code
        </Typography>
        <Box
          width='100%'
          mx='auto'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <img src={scanQr} width='450px' />
        </Box>
        <Typography
          fontSize='17px'
          position='absolute'
          sx={{ width: "100%" }}
          bottom='1vh'
          color='#B6B6B6'
          fontWeight={500}
        >
          Show my QR Code
        </Typography>
      </Box>
    </DashboardLayout>
  );
}

export default QrCode;
