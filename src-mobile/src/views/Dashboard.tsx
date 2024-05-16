import {Box, Typography} from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AssestCard from '../components/AssestCard';
import DashboardHeader from '../components/DashboardHeader';

import diamondShinyIcon from '../assets/diamond-shiny-icon.svg';
import sendIcon from '../assets/send-icon.svg';
import receiveIcon from '../assets/receive-icon.svg';

import availLogo from '../assets/avail-icon.svg';

const Dashboard = () => {
  const DASHBOARD_ITEMS = [
    { icon: diamondShinyIcon },
    { icon: sendIcon },
    { icon: receiveIcon },
    { icon: receiveIcon },
  ];
  const assetData = [
    { image_ref: availLogo, symbol: "Avail", total: 140, value: 50 },
  ];
  return (
    <DashboardLayout>
      <DashboardHeader />
      <Typography color='#fff'>Total Balance</Typography>
      <Typography
        sx={{ textShadow: "0 0 15px #00FFAA" }}
        color='#00FFAA'
        fontWeight={600}
        fontSize='40px'
      >
        $48,000.00
      </Typography>
      <Typography color='#01FFAA'>+450.6%</Typography>
      <Box
        display='flex'
        alignItems='center'
        my={3}
        justifyContent='space-between'
        width='90%'
        mx='auto'
      >
        {DASHBOARD_ITEMS.map(({ icon }, i) => (
          <Box
            borderRadius='9px'
            p={1}
            height='63px'
            width='62px'
            display='flex'
            alignItems='center'
            justifyContent='center'
            bgcolor='#2A2A2A'
            key={i}
          >
            <img src={icon} />
          </Box>
        ))}
      </Box>

      <Box display='flex' mb={2}>
        <Typography
          fontWeight={500}
          borderBottom='1px solid #FFFFFF'
          fontSize='20px'
          width='content-fit'
          mr={2}
        >
          Assets
        </Typography>

        <Typography
          fontWeight={500}
          // borderBottom='1px solid #FFFFFF'
          fontSize='20px'
          width='content-fit'
        >
          NFT
        </Typography>
      </Box>

      {assetData.map((item) => (
        <AssestCard {...item} />
      ))}
    </DashboardLayout>
  );
};

export default Dashboard;
