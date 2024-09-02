import React from "react";
import { Box, Switch, Typography, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SmallText400 } from "../typography/typography";

// Custom styled switch
const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 40, // Set the desired width
  height: 22, // Set the desired height
  padding: 0, // Remove padding for a snug fit
  display: "flex",
  alignItems: "center", // Center the thumb vertically

  "& .MuiSwitch-switchBase": {
    padding: 2, // Adjust padding to fit thumb within track
    transform: "translateX(2px)", // Initial thumb position
    "&.Mui-checked": {
      transform: "translateX(18px)", // Position when checked
      color: "#FDFFFE",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#6A0DF8", // Background color when checked
      },
      "&:hover": {
        backgroundColor: "rgba(0, 255, 170, 0.08)", // Hover effect
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 18, // Adjust thumb width to fit within the track
    height: 18, // Adjust thumb height to fit within the track
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2, // Half of track height for rounded edges
    opacity: 1,
    backgroundColor: "#6A0DF8", // Track background color
    boxSizing: "border-box",
  },
}));

type ToggleRowProperties = {
  label: string;
  checked: boolean;
  fee: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type SettingsProperties = {
  fee: string;
  onTransferFromToggle: (checked: boolean) => void;
  onTransferToToggle: (checked: boolean) => void;
  onFeeToggle: (checked: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProperties> = ({
  label,
  checked,
  fee,
  onChange,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "start",
      mb: "1%",
    }}
  >
    <CustomSwitch checked={checked} onChange={onChange} />
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignContent: "end",
        alignItems: "end",
      }}
    >
      <Typography
        sx={{
          color: "#A6A6A6",
          fontWeight: "400",
          fontSize: "14px",
          ml: "15px",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: "#A6A6A6", fontSize: "10px", ml: "2px" }}>
        {(fee ?? 0.0) + " ALEO"}
      </Typography>
    </Box>
  </Box>
);

const SettingsComponent: React.FC<SettingsProperties> = ({
  fee,
  onTransferFromToggle,
  onTransferToToggle,
  onFeeToggle,
}) => {
  const [isPrivateTransferFrom, setIsPrivateTransferFrom] =
    React.useState(false);
  const [isPrivateTransferTo, setIsPrivateTransferTo] = React.useState(false);
  const [isPrivateFee, setIsPrivateFee] = React.useState(false);

  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "86%",
        alignSelf: "center",
        ml: "2%",
        mt: "3%",
      }}
    >

      <ToggleRow
        label={
          isPrivateFee
            ? t("send.privacy-toggles.private-fee")
            : t("send.privacy-toggles.public-fee")
        }
        fee={fee}
        checked={isPrivateFee}
        onChange={(e) => {
          //This is what sets the private or public feature
          setIsPrivateFee(e.target.checked);
          onFeeToggle(e.target.checked);

          // This is for sending from private
          setIsPrivateTransferFrom(e.target.checked);
          onTransferFromToggle(e.target.checked);

          //This for sendoing to public
          setIsPrivateTransferTo(e.target.checked);
          onTransferToToggle(e.target.checked);
        }}
      />
    </Box>
  );
};

export default SettingsComponent;
