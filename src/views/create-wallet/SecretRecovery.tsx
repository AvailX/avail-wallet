import { ContentCopy } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import React, { useEffect } from "react";
import SwipeableEdgeDrawer from "../../components/SwipeableDrawer";

import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const SecretRecovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { phrase }: { phrase: string } = location.state || {};

  useEffect(() => {
    console.log("Location phrase", phrase);
  }, []);

  const goToOther = () => {
    navigate("/points");
  };
  const recoveryPhase = phrase.split(" ");

  const [open, setOpen] = React.useState<boolean>(true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(recoveryPhase.toString())
      .then(() => {
        toast.success("Copied to clipboard"); // Use toast.success for success message
      })
      .catch((err) => {
        toast.error("Failed to copy to clipboard"); // Handle errors with toast.error
        console.error("Clipboard write error:", err);
      });
  };

  return (
    <>
      <Box
        pt={16}
        px={3}
        position='relative'
        sx={{ overflowY: "auto" }}
        height='100vh'
        bgcolor='#111111'
        color='#fff'
        textAlign='center'
      >
        <Typography fontSize='25px' fontWeight={700}>
          Your secret recovery phrase
        </Typography>
        <Typography fontSize='18px' color='#A7A7A7'>
          Write it down in order. You can find it later on in settings.
        </Typography>

        <Box
          display='grid'
          gap={4}
          gridTemplateColumns='1fr 1fr'
          width='100%'
          mx='auto'
          mt={3}
        >
          {recoveryPhase.map((phrase, i) => (
            <Box px={2} py={1} key={i} bgcolor='#3E3E3E' borderRadius='9px'>
              <Typography width='100%' fontWeight={600}>
                {i + 1}. {phrase}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          width='100%'
          position='absolute'
          display='flex'
          gap={2}
          p={2}
          left={0}
          bottom={30}
          // height='auto'
          zIndex={10}
        >
          <Button
            fullWidth
            sx={{
              background:
                "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
              py: 1,
              fontSize: "20px",
            }}
            variant='contained'
            type='submit'
            onClick={() => {
              navigate("/verify-saved", { state: { phrase: recoveryPhase } });
            }}
          >
            Next
          </Button>
          <IconButton
            sx={{ bgcolor: "#3E3E3E", width: "57px", borderRadius: "9px" }}
            onClick={handleCopyToClipboard}
          >
            <ContentCopy sx={{ color: "#00FFAA" }} />
          </IconButton>
        </Box>
      </Box>
      <SwipeableEdgeDrawer open={open} toggleDrawer={() => toggleDrawer(true)}>
        <Box position='relative'>
          <Box
            bgcolor='#00FFAA'
            width='70%'
            mx='auto'
            textAlign='center'
            borderRadius='14px'
            mt={6}
            boxShadow='0 0 15px #00FFAA'
          >
            <Typography fontSize='40px' fontWeight={700}>
              Caution
            </Typography>
          </Box>

          <Typography
            color='#fff'
            textAlign='center'
            fontSize='25px'
            fontWeight={700}
            mt={6}
          >
            Screenshots aren’t safe
          </Typography>

          <Typography
            textAlign='center'
            fontSize='18px'
            color='#A7A7A7'
            lineHeight='20.88px'
          >
            If someone gains access to your photos, they can access your
            wallet...
          </Typography>

          <Box
            sx={{
              mx: "auto",
              display: "flex",
              alignItems: "center",
            }}
            mt={10}
          >
            <Button
              onClick={() => setOpen(false)}
              sx={{ mx: "auto", fontSize: "20px" }}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </SwipeableEdgeDrawer>
    </>
  );
};

export default SecretRecovery;
