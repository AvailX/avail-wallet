import { Box, Typography } from "@mui/material";
import qrCode from "../../assets/qrcode.svg";
import copyIcon from "../../assets/copy-icon.svg";
import { truncateText } from "components/DashboardHeader";
import { toast } from "react-toastify";

interface IReceiveItemProps {
  header: string;
  walletAddress: string;
  image?: string | undefined;
  onQrCodeClick: () => void;
}
const ReceiveItem: React.FC<IReceiveItemProps> = ({
  header,
  walletAddress,
  image,
  onQrCodeClick,
}) => {
  //This function enables copying wallet address to clipboard
  const copyAddress = () => {
    navigator.clipboard
      .writeText(walletAddress)
      .then(() => {
        toast.success("Wallet address copied to clipboard!");
        console.log("NOTE: <<address has been copied>> ");
      })
      .catch(() => {
        toast.error("Failed to copy wallet address.");
        console.log("ERROR: <<could not copy address>>");
      });
  };

  return (
    <>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        {image !== "undefined" ? (
          <img src={image} alt="" />
        ) : (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "3rem",
              height: "3rem",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          >
            A
          </Box>
        )}
        <Box style={{ marginRight: "auto", marginLeft: "1rem" }}>
          <Typography style={{ color: "#B6B6B6" }}>{header}</Typography>
          <Typography style={{ color: "#969696" }}>
            {truncateText(walletAddress, 10)}
          </Typography>
        </Box>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <img
            src={qrCode}
            alt=""
            width={"30rem"}
            style={{ marginInline: "1rem", cursor: "pointer"  }}
            onClick={onQrCodeClick}
          />
          <img
            src={copyIcon}
            alt=""
            width={"30rem"}
            onClick={() => copyAddress()}
          />
        </Box>
      </Box>
    </>
  );
};

export default ReceiveItem;
