import { Box, Typography } from "@mui/material";

import qrCode from "../../assets/qrcode.svg";
import copyIcon from "../../assets/copy-icon.svg";

interface IReceiveItemProps {
  header: string;
  walletAddress: string;
  image?: string | undefined;
}
const ReceiveItem: React.FC<IReceiveItemProps> = ({
  header,
  walletAddress,
  image,
}) => {
  return (
    <>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5",
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
          <Typography style={{ color: "#969696" }}>{walletAddress}</Typography>
        </Box>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4",
          }}
        >
          <img
            src={qrCode}
            alt=""
            width={"30rem"}
            style={{ marginInline: "1rem" }}
          />
          <img src={copyIcon} alt="" width={"30rem"} />
        </Box>
      </Box>
    </>
  );
};

export default ReceiveItem;
