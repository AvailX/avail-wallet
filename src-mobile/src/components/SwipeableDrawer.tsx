import * as React from "react";
import { Global } from "@emotion/react";

import CssBaseline from "@mui/material/CssBaseline";

import { Button, Box, Typography, SwipeableDrawer } from "@mui/material";

import ViewProfile from "./ViewProfile";

import settingsIcon from "../assets/settings-icon.svg";
import { Puller, Root, StyledBox } from "./styled";

const drawerBleeding = 26;

interface Props {
  window?: () => Window;
  open: boolean;
  toggleDrawer: (newOpen: boolean) => React.ReactEventHandler<{}>;
  children?: React.ReactNode;
}

export default function SwipeableEdgeDrawer(props: Props) {
  const {
    window,
    open,
    toggleDrawer,
    children = (
      <Box>
        <Typography color='#fff' fontSize='20px' fontWeight={700}>
          Wallets
        </Typography>
        <Typography color='#B0B0B0' my={2}>
          WALLET 1
        </Typography>
        <ViewProfile />
        <Box mx='auto' width='90%' my={2}>
          <Button
            fullWidth
            endIcon={<img src={settingsIcon} />}
            sx={{
              borderRadius: "20px",
              mx: "auto",
              bgcolor: "#2A3331",
              border: "0px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Add & manage wallets
          </Button>
        </Box>
      </Box>
    ),
  } = props;

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: `calc(50% - ${drawerBleeding}px)`,
            overflow: "visible",
          },
          ".MuiDrawer-root > .MuiBackdrop-root": {
            backdropFilter: "blur(3px)",
          },
        }}
      />

      {open && (
        <SwipeableDrawer
          container={container}
          anchor='bottom'
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          swipeAreaWidth={drawerBleeding}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: false,
          }}
          sx={{
            ".MuiDrawer-paper ": {
              height: "calc(100% - 404px)",
              top: 404,
            },
          }}
        >
          <StyledBox
            sx={{
              position: "absolute",
              top: -drawerBleeding,
              visibility: "visible",
              right: 0,
              left: 0,
              bgcolor: "#111111",
              backgroundColor: "transparent",
            }}
          >
            <Puller />
            <Typography sx={{ p: 2, color: "transparent" }}></Typography>
          </StyledBox>
          <StyledBox
            sx={{
              pb: 2,
              height: "100%",
              overflow: "auto",
              bgcolor: "#111111",
            }}
          >
            <Box
              sx={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                p: 3,
                //boxShadow: "0px 4px 4px 0px #00FFAA40 inset",
                bgcolor: "#1E1E1E",
              }}
              width='100%'
              height='100%'
              overflow='auto'
            >
              {children}
            </Box>
          </StyledBox>
        </SwipeableDrawer>
      )}
    </Root>
  );
}
