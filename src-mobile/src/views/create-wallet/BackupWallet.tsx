import { Box, Button, IconButton, Typography } from "@mui/material";

import backupHand from "../../assets/backup-hand.png";
import { useNavigate } from "react-router-dom";
import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { Languages } from "../../../../src/types/languages";
import type { AvailError } from "../../../../src/types/errors";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const BackupWallet = () => {
  const [account, setAccount] = React.useState<string>("");
  const [key, setKey] = React.useState<string>("");
  const [label, setLabel] = React.useState<string>("");
  const [resultMessage, setResultMessage] = React.useState<string>("");
  const [resultMessage2, setResultMessage2] = React.useState<string>("");

  async function setKeysIos() {
    await invoke("store_keys_ios", {
      service: "com.avail.wallet.p",
      account,
      key,
      label,
    })
      .then((res) => {
        setResultMessage(`Store keys success: ${res}`);
      })
      .catch((err: AvailError) => {
        setResultMessage(
          `Failed to store keys: ${err.internal_msg} | ${err.external_msg}`
        );
        console.log(err);
      });
  }

  async function getKeyIos() {
    await invoke("get_key_ios", {
      service: "com.avail.wallet.p",
      account,
      label,
    })
      .then((res) => {
        setResultMessage2(`Get keys success: ${res}`);
      })
      .catch((err: AvailError) => {
        setResultMessage2(
          `Failed to get keys: ${err.internal_msg} | ${err.external_msg}`
        );
        console.log(err);
      });
  }

  const navigate = useNavigate();
  const goToOther = () => {
    navigate("/verify-saved");
  };
  return (
    <Box
      pt={16}
      px={3}
      position='relative'
      height='100vh'
      bgcolor='#111111'
      color='#fff'
    >
      {/* !TODO: Fix this */}
      <Box display='flex' alignItems='center' justifyContent='flex-start'>
        <IconButton
          onClick={() => {
            navigate(-1);
          }}
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            bgcolor='#393939'
            width='35px'
            height='35px'
            borderRadius='50%'
            p={3}
          >
            <ArrowBackIosNewIcon sx={{ color: "#BDBDBD" }} />
          </Box>
        </IconButton>
      </Box>
      <Typography
        fontSize='60px'
        textAlign='center'
        fontWeight={700}
        lineHeight='60px'
        color='#fff'
      >
        <span style={{ color: "#00FFAA" }}>Back up </span>
        your wallet
      </Typography>

      <Typography
        textAlign='center'
        mt={3}
        fontSize='18px'
        lineHeight='20.88px'
      >
        If you ever lose access to your account, you'll need your secret
        recovery phrase to recover your crypto.{" "}
        <span style={{ color: "#00FFAA" }}>Never share it with anyone.</span>
      </Typography>

      {/*<Box*/}
      {/*    mx='auto'*/}
      {/*    display='flex'*/}
      {/*    alignItems='center'*/}
      {/*    justifyContent='center'*/}
      {/*    mt={8}*/}
      {/*>*/}
      {/*  <img src={backupHand} width='166px' />*/}
      {/*</Box>*/}
      <Box display='flex' flexDirection={"column"} gap={2}>
        <input
          type='text'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={"Label"}
        />
        <input
          type='text'
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder={"Account"}
        />
        <input
          type='text'
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={"Key"}
        />
        <button onClick={() => setKeysIos()}>Store Keys</button>
        {resultMessage && <p style={{ color: "white" }}>{resultMessage}</p>}
        <button onClick={() => getKeyIos()}>Get Keys</button>
        {resultMessage2 && <p style={{ color: "white" }}>{resultMessage2}</p>}
      </Box>

      <Box
        width='100%'
        position='absolute'
        p={2}
        left={0}
        bottom={50}
        height='auto'
        zIndex={10}
      >
        <Button
          fullWidth
          onClick={() => {
            navigate("/secret-recovery");
          }}
          sx={{
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
            py: 2,
          }}
          variant='contained'
          type='submit'
        >
          Reveal Phrase
        </Button>
        <Button
          sx={{ mt: 3, bgcolor: "#3E3E3E !important" }}
          fullWidth
          variant='outlined'
        >
          Skip
        </Button>
      </Box>
    </Box>
  );
};

export default BackupWallet;
