import {
  Box,
  Button,
  Checkbox,
  Typography,
  checkboxClasses,
} from "@mui/material";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";

import React from "react";

const VerifySaved = () => {
  const recoveryPhase = [
    "Babayaga",
    "One",
    "Takeover",
    "Champion",
    "Privacy",
    "Fear",
    "Donkey",
    "Puzzle",
    "Ultra",
    "Horse",
    "Frontline",
    "Cold",
  ];

  const [open, setOpen] = React.useState<boolean>(true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };

  return (
    <>
      <Box
        pt={16}
        px={3}
        position='relative'
        height='100vh'
        bgcolor='#111111'
        color='#fff'
        textAlign='center'
      >
        <Typography fontWeight={700} fontSize='25px'>
          Verify it’s saved correctly
        </Typography>
        <Typography fontSize='18px' mt={1} color='#A7A7A7' lineHeight='20.88px'>
          Tap the words below in order to confirm you have saved{" "}
        </Typography>

        <Box>
          <Box
            mt={3}
            height='30vh'
            display='flex'
            alignItems='flex-end'
            justifyContent='center'
            border='2px solid #00FFAA'
            borderRadius='9px'
            boxShadow='0px 4px 4px 0px #00000040'
          >
            <Typography color='#00FFAA'>Paste</Typography>
          </Box>
        </Box>

        <Box
          display='grid'
          gap={2}
          gridTemplateColumns='1fr 1fr 1fr'
          width='100%'
          mx='auto'
          mt={3}
        >
          {recoveryPhase.map((phrase, i) => (
            <Box px={1} py={1} bgcolor='#3E3E3E' borderRadius='9px' key={i}>
              <Typography width='100%' fontSize='14px' fontWeight={600}>
                {phrase}
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
          height='auto'
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
          >
            Verify
          </Button>
        </Box>

        <SwipeableEdgeDrawer
          open={open}
          toggleDrawer={() => toggleDrawer(true)}
        >
          <Box>
            <Typography color='#FFFFFF' fontSize='25px' fontWeight={700}>
              Confirm you’ve saved it well
            </Typography>
            <Box display='flex' alignItems='flex-start' mb={3} mt={1}>
              <Checkbox
                sx={{
                  [`&, &.${checkboxClasses.checked}`]: {
                    color: "#00FFAA",
                  },
                }}
              />
              <Typography
                ml={1}
                color='#A7A7A7'
                fontSize='18px'
                lineHeight='20.88px'
              >
                I understand that if I lose my phone or wallet I will need my
                secret recovery phrase to retrieve my wallet.
              </Typography>
            </Box>

            <Box display='flex' alignItems='flex-start' mb={3} mt={1}>
              <Checkbox
                sx={{
                  [`&, &.${checkboxClasses.checked}`]: {
                    color: "#00FFAA",
                  },
                }}
              />
              <Typography
                ml={1}
                color='#A7A7A7'
                fontSize='18px'
                lineHeight='20.88px'
              >
                I understand that if I lose my phone or wallet I will need my
                secret recovery phrase to retrieve my wallet.
              </Typography>
            </Box>

            <Button
              fullWidth
              sx={{
                background:
                  "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
                py: 2,
              }}
              variant='contained'
              type='submit'
            >
              Confirm
            </Button>
            <Button
              sx={{ mt: 3, bgcolor: "#3E3E3E !important" }}
              fullWidth
              variant='outlined'
            >
              Back
            </Button>
          </Box>
        </SwipeableEdgeDrawer>
      </Box>
    </>
  );
};

export default VerifySaved;
