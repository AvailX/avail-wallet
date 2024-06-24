import {
  Box,
  Button,
  Checkbox,
  Typography,
  checkboxClasses,
} from "@mui/material";
import SwipeableEdgeDrawer from "../../components/SwipeableDrawer";

import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GoBack from "../../shared/GoBack";

const VerifySaved = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { phrase }: { phrase: string[] } = location.state || {};

  function shuffleArray(array: string[]) {
    let shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  }

  const recoveryPhase: string[] = phrase;

  console.log("recoveryPhrase", recoveryPhase);

  const [open, setOpen] = React.useState<boolean>(!true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(!newOpen);
  };

  const [pastedItems, setPastedItems] = useState<string[]>([]);

  function areArraysEqual(array1: string[], array2: string[]) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  async function pasteItems() {
    const itemsToPaste = await navigator.clipboard.readText();
    setPastedItems(itemsToPaste.split(","));
  }

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
        sx={{ overflowY: "auto" }}
      >
        <GoBack />
        <Typography fontWeight={700} fontSize='25px'>
          Verify it’s saved correctly
        </Typography>
        <Typography fontSize='18px' mt={1} color='#A7A7A7' lineHeight='20.88px'>
          Tap the words below in order to confirm you have saved{" "}
        </Typography>

        {areArraysEqual(phrase, pastedItems) && (
          <Box mb={5}>
            <Typography color='red'>Correct</Typography>
          </Box>
        )}

        <Box>
          <Box
            mt={3}
            p={3}
            height='30vh'
            display='flex'
            justifyContent='center'
            border='2px solid #00FFAA'
            borderRadius='9px'
            boxShadow='0px 4px 4px 0px #00000040'
            position='relative'
          >
            <Box
              display='grid'
              justifyContent='space-between'
              gridTemplateColumns='1fr 1fr 1fr'
              gap={1}
              height='auto'
              sx={{ overflowY: "auto" }}
            >
              {pastedItems.map((item, i) => (
                <Box
                  px={1}
                  py={1}
                  height='40px'
                  bgcolor='#3E3E3E'
                  borderRadius='9px'
                  key={i}
                >
                  <Typography width='100%' fontSize='14px' fontWeight={600}>
                    {i + 1}. {item}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box
              display='flex'
              position='absolute'
              sx={{ bottom: "5px", pt: 10 }}
            >
              <Typography
                onClick={() => pasteItems()}
                sx={{ bottom: "5px" }}
                color='#00FFAA'
              >
                Paste
              </Typography>
              <Typography
                onClick={() => {
                  setPastedItems([]);
                }}
                color='red'
                sx={{ ml: 1 }}
              >
                Clear
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          display='grid'
          gap={2}
          gridTemplateColumns='1fr 1fr 1fr'
          width='100%'
          mx='auto'
          mt={3}
          sx={{ height: "200px" }}
        >
          {shuffleArray(recoveryPhase)
            .filter((x) => !pastedItems.includes(x))
            .map((phr, i) => (
              <Box
                onClick={() => {
                  setPastedItems([...pastedItems, phr]);
                }}
                sx={{ overflowY: "hidden" }}
                p={2}
                display='flex'
                alignItems='center'
                justifyContent='center'
                bgcolor='#3E3E3E'
                borderRadius='9px'
                key={i}
              >
                <Typography width='100%' fontSize='14px' fontWeight={600}>
                  {phr}
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
            onClick={() => {
              if (areArraysEqual(pastedItems, phrase)) {
                setOpen(true);
              } else {
                toast.error("Didn't match order");
              }
            }}
            variant='contained'
            type='submit'
          >
            Verify
          </Button>
        </Box>
      </Box>
      <SwipeableEdgeDrawer open={open} toggleDrawer={() => toggleDrawer(true)}>
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

          <Button
            fullWidth
            onClick={() => {
              setOpen(false);
              navigate("/data-pointers");
            }}
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
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </Button>
        </Box>
      </SwipeableEdgeDrawer>
    </>
  );
};

export default VerifySaved;
