import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { BodyText500 } from "../typography/typography";
import { useScan } from "../../context/ScanContext";

type CtaButtonProperties = {
  text: string;
  onClick?: () => void;
  width: string;
};

const CtaButton = styled(Button)({
  backgroundColor: "#7000FF",
  color: "#fff",
  fontWeight: "bold",
  padding: "10px 20px",
  transition: "transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out",
  width: "100%",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#7000FF",
    // boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
    transform: "scale(1.03)",
  },
  "&:focus": {
    backgroundColor: "#7000FF",
    // boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
  },
  alignSelf: "center",
});

export default function CTAButton({
  text,
  onClick,
  width,
}: CtaButtonProperties) {
  const { scanInProgress, startScan, endScan } = useScan();

  const isDisabled = (parameter: string) => {
    if (parameter == "Full ReSync" && scanInProgress) {
      return true;
    }

    return false;
  };

  return (
    <CtaButton
      onClick={onClick}
      disabled={isDisabled(text)}
      sx={{ width, fontFamily: '"DM Sans", sans-serif', marginRight: "10px" }}
    >
      <BodyText500>{text}</BodyText500>
    </CtaButton>
  );
}
