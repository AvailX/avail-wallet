// Components
import Layout from '../reusable/layout';
import SideMenu from '../../components/sidebar';
import CampaignView from '../../components/quests/campaign';
import greenGlow from '../../assets/images/backgrounds/gglow_quests.png';

// Typography
import { LargeTitleText } from '../../components/typography/typography';

// Testing
import { type Campaign, testCampaign } from '../../types/quests/quest_types';

// Services
import { getCampaigns } from '../../services/quests/quests';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';

function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    getCampaigns()
      .then((campaigns) => {
        setCampaigns(campaigns);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Layout>
      <SideMenu />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: '3%',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'url(' + greenGlow + ') no-repeat ',
          paddingBottom: '7%',
        }}
      >
        <LargeTitleText sx={{ color: '#FFF' }}> Web3 Privacy</LargeTitleText>
        <LargeTitleText
          sx={{ color: '#00FFAA', textShadow: '0 0 10px #00FFAA' }}
        >
          {' '}
          Quests{' '}
        </LargeTitleText>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: '3%' }}>
        {campaigns.map((campaign) => (
          <CampaignView {...campaign} key={campaign.id} />
        ))}
      </Box>
    </Layout>
  );
}

export default Campaigns;
