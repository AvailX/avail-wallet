import * as React from 'react';
import { styled } from '@mui/system';
import { Box, Typography, Divider as MuiDivider } from '@mui/material';
import Background from '../../components/quests/Background';
import ProfileContainer from '../../components/quests/ProfileContainer';
import NewContainer from '../../components/quests/NewContainer';
import verified from '../../assets/icons/verified.svg'; // Import the verified icon

// Sample campaign data
const campaign = {
  bg_image: 'https://via.placeholder.com/800x300', // Replace with your campaign background image URL
  profile_image: 'https://via.placeholder.com/150', // Replace with your campaign profile image URL
  title: 'Disruptors',
  inner_description: 'Welcome to the Disruptor Quests, for those who want to enact change and make an impact.',
};

// Sample quests data
const quests = [
  {
    title: 'Mission Week 1',
    description: '100 Drops',
  },
  {
    title: 'Mission Week 2',
    description: '200 Drops',
  },
  {
    title: 'Mission Week 3',
    description: '300 Drops',
  },
  {
    title: 'Mission Week 4',
    description: '400 Drops',
  },
];

const newBackgroundImageUrl = 'https://via.placeholder.com/300x200'; // Replace with your new container background image URL

const Container = styled(Box)({
  position: 'relative',
  overflow: 'visible',
  backgroundColor: 'black',
  paddingBottom: '100px',
  color: 'white',
  minHeight: '100vh',
});

const TransparentBackground = styled(Box)({
  position: 'relative',
  height: '240px',
  display: 'flex',
  marginTop: '-45px',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
});

const ProfileText = styled(Box)({
  marginLeft: '5%',
  right: '10px',
});

const Divider = styled(MuiDivider)({
  marginTop: '10px',
  mb: '10px',
  backgroundColor: '#00FFAA',
});

const Quests: React.FC = () => (
  <Container>
    <TransparentBackground>
      <Background bgImage={campaign.bg_image} />
      <ProfileContainer profileImageSrc={campaign.profile_image} verifiedBadgeSrc={verified} />
    </TransparentBackground>
    <ProfileText>
      <Typography fontSize={'16px'}>{campaign.title}</Typography>
      <Typography fontSize={'13px'}>{campaign.inner_description}</Typography>
    </ProfileText>
    <Divider />
    {quests.map((quest, index) => (
      <NewContainer key={index} title={quest.title} description={quest.description} bgImage={newBackgroundImageUrl} />
    ))}
  </Container>
);

export default Quests;
