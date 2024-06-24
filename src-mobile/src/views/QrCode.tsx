import DashboardLayout from "../layouts/DashboardLayout";

import scanQr from "../assets/scan-qr.png";
import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

import { scan, Format } from "@tauri-apps/plugin-barcode-scanner";
import { useEffect } from "react";

// `windowed: true` actually sets the webview to transparent
// instead of opening a separate view for the camera
// make sure your user interface is ready to show what is underneath with a transparent element
// scan({ windowed: true, formats: [Format.QRCode] });

function QrCode() {
  useEffect(() => {
    // `windowed: true` actually sets the webview to transparent
    // instead of opening a separate view for the camera
    // make sure your user interface is ready to show what is underneath with a transparent element
    scan({ windowed: true, formats: [Format.QRCode] });
  }, []);
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
