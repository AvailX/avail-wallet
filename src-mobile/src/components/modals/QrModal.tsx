import QRCode from "react-qr-code";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";

interface IReceiveQrProps {
  walletAddress: string;
  onLeadingClick: () => void; // Add this prop for the back button click handler
}

const ReceiveQR: React.FC<IReceiveQrProps> = ({
  walletAddress,
  onLeadingClick,
}) => {
  return (
    <Box>
      <Typography
        style={{
          color: "#00FFAA",
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Receive
      </Typography>
      <Typography
        style={{
          color: "#979797",
          marginBlock: "1.5rem",
          fontSize: "1.2rem",
        }}
      >
        Scan to receive Crypto and NFTs
      </Typography>
      <IconButton
        onClick={onLeadingClick}
        sx={{
          position: "absolute",
          top: "2rem",
          left: "1rem",
          color: "#FFFFFF",
        }}
      >
        <ArrowBackIos />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <QRCode value={walletAddress} size={250} />
      </Box>
    </Box>
  );
};

export default ReceiveQR;
