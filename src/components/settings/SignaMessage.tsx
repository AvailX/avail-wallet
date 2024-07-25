import React from "react";
import * as mui from "@mui/material";
import STButton from "../settings/settings-button";
import WhiteHueTextField from "../../../src-desktop/components/textfields/white-hue";
import { SmallText400 } from "../../../src-desktop/components/typography/typography";
import { sign, verify } from "../../../src-desktop/services/util/sign";
import { Typography, Stack } from "@mui/material";

function SignaMessage() {
  const [success, setSuccess] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");
  const [signature, setSignature] = React.useState<string>("");
  const [signMessage, setSignMessage] = React.useState<string>("");

  const handleSign = () => {
    sign(message)
      .then((res) => {
        if (res.signature) {
          setSignature(res.signature);
          setMessage("Message signed successfully.");
          setSuccess(true);
        }
      })
      .catch((error_) => {
        console.log(error_);
        setMessage("Error signing message. Please try again.");
        setError(true);
      });
  };
  return (
    <mui.Box>
      <Stack direction="column" spacing={1}>
        <mui.Box sx={{ display: "flex", flexDirection: "column", mt: "1%" }}>
          <WhiteHueTextField
            sx={{ width: "100%" }}
            inputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#fff" } }}
            value={signMessage}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSignMessage(event.target.value);
            }}
            label="message"
          />
        </mui.Box>
        <STButton
          text="Sign"
          onClick={() => {
            handleSign();
          }}
        />
        <SmallText400
          sx={{
            color: "#fff",
            mt: "2%",
            mb: "2%",
            wordWrap: "break-word",
          }}
        >
          {signature}
        </SmallText400>
      </Stack>
    </mui.Box>
  );
}

export default SignaMessage;
