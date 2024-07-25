import DashboardLayout from "../layouts/DashboardLayout";
import { Box, Button, Divider, Typography } from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import discordIcon from "../assets/discord-green.svg";
import xIcon from "../assets/x-green.svg";

import privateIcon from "../assets/private-icon.svg";
import eyeIconf from "../assets/eye-icon.svg";

import avail3d from "../assets/avail-3d.svg";

import verifiedIcon from "../assets/verified-icon.svg";

const AvailPoints = () => {
  return (
    <DashboardLayout>
      <Box mt={-5}>
        <Box
          mx='auto'
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <img src={avail3d} />
          <Typography fontSize='25px' mr={1} fontWeight={500}>
            Avail
          </Typography>
          <img src={verifiedIcon} />
        </Box>
        <Divider
          sx={{
            height: "1px",
            width: "80%",
            bgcolor: "#353535",
            my: 2,
            mx: "auto",
          }}
        />
        <Box
          px={3}
          my={3}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width='95%'
          gap={2}
          mx='auto'
        >
          <Button
            sx={{
              bgcolor: "#264139",
              border: "0px",
              color: "#00FFAA",
              width: "100%",
            }}
            startIcon={<ArrowUpwardIcon />}
          >
            <Typography fontSize='22px' fontWeight={500}>
              Send
            </Typography>
          </Button>
          <Button
            sx={{
              bgcolor: "#264139",
              border: "0px",
              color: "#00FFAA",
              width: "100%",
            }}
            startIcon={<ArrowDownwardIcon />}
          >
            <Typography fontSize='22px' fontWeight={500}>
              Receive
            </Typography>
          </Button>
        </Box>

        <Divider
          sx={{
            height: "1px",
            width: "80%",
            bgcolor: "#353535",
            my: 2,
            mx: "auto",
          }}
        />

        <Box textAlign='left'>
          <Typography color='#979797' fontSize='17px' fontWeight={700}>
            Avail Balance
          </Typography>
          <Typography fontSize='25px' fontWeight={500}>
            969.00 AVAIL
          </Typography>
        </Box>

        <Box
          my={4}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          gap={2}
        >
          <Box bgcolor='#141c1a' width='100%' p={1} borderRadius='9px'>
            <Box display='flex' alignItems='center'>
              <img src={eyeIconf} style={{ marginRight: "5px" }} />
              <Typography>Public</Typography>
            </Box>
            <Typography sx={{ width: "100%", textAlign: "left" }}>
              969.00 AVAIL
            </Typography>
          </Box>
          <Box bgcolor='#141c1a' p={1} width='100%' borderRadius='9px'>
            <Box display='flex' alignItems='center'>
              <img src={eyeIconf} style={{ marginRight: "5px" }} />
              <Typography>Public</Typography>
            </Box>
            <Typography sx={{ width: "100%", textAlign: "left" }}>
              969.00 AVAIL
            </Typography>
          </Box>
        </Box>

        <Box textAlign='left' mt={3}>
          <Typography fontWeight={700} fontSize='17px' color='#979797' mb={2}>
            Learn
          </Typography>
          <Typography color='#969696' fontSize='15px'>
            Avail token is the official token of the avail wallet, the first
            open source wallet on the Aleo Blockchain. The top 15000 avail
            holders receive airdrops in proportion to tokens held.
          </Typography>

          <Box mt={5}>
            <img src={discordIcon} style={{ marginRight: "10px" }} />
            <img src={xIcon} />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AvailPoints;
