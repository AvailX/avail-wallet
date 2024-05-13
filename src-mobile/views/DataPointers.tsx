import { Box, Button, Typography } from "@mui/material";

import img from "../assets/data-pointers.png";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";
import React from "react";

const DataPointers = () => {
  const [open, setOpen] = React.useState<boolean>(true);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };
  return (
    <Box
      height='100vh'
      position='relative'
      sx={{ backgroundImage: `url(${img})`, backgroundSize: "cover" }}
    >
      <Typography
        marginTop='10vh'
        mx='auto'
        width='90%'
        color='#fff'
        textAlign='center'
        fontSize='25px'
        px={3}
        fontWeight={700}
        lineHeight='31.8px'
      >
        Want us to backup your{" "}
        <span style={{ color: "#00FFAA" }}>data pointers</span>?
      </Typography>
      <Typography
        textAlign='center'
        px={3}
        mt={2}
        fontSize='18px'
        color='#9c9c9c'
        lineHeight='27px'
        fontWeight={400}
      >
        Data Pointers help find your records and transactions on the blockchain
        faster than scanning.{" "}
      </Typography>

      <Box
        width='100%'
        position='absolute'
        p={2}
        left={0}
        bottom={0}
        height='auto'
        zIndex={10}
        pb={5}
      >
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
          Backup
        </Button>
        <Button
          sx={{ mt: 3, bgcolor: "#3E3E3E", color: "#fff", border: "0px" }}
          fullWidth
          //   variant='outlined'
        >
          Don't Backup
        </Button>
      </Box>

      <SwipeableEdgeDrawer toggleDrawer={() => toggleDrawer(true)} open={open}>
        <Typography
          textAlign='center'
          fontSize='25px'
          fontWeight={700}
          color='#fff'
        >
          Backup or not?
        </Typography>
        <Typography color='#D8D4D4' textAlign='center' mt={4}>
          If you choose to backup, the pointers will be encrypted with your
          viewing key and stored on our database system. When you recover your
          Avail wallet like this you instantly get access to all your record and
          past transaction history.
        </Typography>

        <Button
          sx={{ mt: 3, bgcolor: "#3E3E3E", color: "#fff", border: "0px" }}
          fullWidth
          //   variant='outlined'
        >
          Back
        </Button>
      </SwipeableEdgeDrawer>
    </Box>
  );
};

export default DataPointers;
