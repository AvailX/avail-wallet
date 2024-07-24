import DashboardLayout from "../layouts/DashboardLayout";

import { Box, Typography } from "@mui/material";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function QrCode() {
  const navigate = useNavigate();

  function isAleoAddress(address: string): boolean {
    const prefix = "aleo";
    const expectedLength = 64;

    // Check if the address starts with the prefix and has the expected length
    if (
      address.toLowerCase().startsWith(prefix) &&
      address.length === expectedLength
    ) {
      // Check if the address only contains alphanumeric characters
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      return alphanumericRegex.test(address);
    }

    return false;
  }

  return (
    <DashboardLayout>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
      >
        <Typography variant='h4' fontWeight={600} mb={2}>
          Scan Aleo QR Below
        </Typography>
        <Scanner
          allowMultiple
          paused={false}
          onScan={(result) => {
            console.log("Scanned result", result[0]?.rawValue);
            if (isAleoAddress(result[0]?.rawValue)) {
              navigate("/input-send", {
                state: { address1: result[0]?.rawValue },
              });
            } else {
              toast.error("Not an Aleo Address");
            }
          }}
        />
      </Box>
    </DashboardLayout>
  );
}

export default QrCode;
