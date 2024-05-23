import * as React from 'react';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import ProfileImageWrapper from './ProfileImageWrapper';
import VerifiedBadgeWrapper from './VerifiedBadgeWrapper';

const ProfileContainerBox = styled(Box)({
  position: 'absolute',
  top: '100px',
  left: '20%',
  transform: 'translateX(-50%)',
  width: '130px',
  height: '130px',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  zIndex: 1,
});

interface ProfileContainerProps {
  profileImageSrc: string;
  verifiedBadgeSrc: string;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ profileImageSrc, verifiedBadgeSrc }) => (
  <ProfileContainerBox>
    <ProfileImageWrapper src={profileImageSrc} alt="Profile" />
    <VerifiedBadgeWrapper src={verifiedBadgeSrc} alt="Verified" />
  </ProfileContainerBox>
);

export default ProfileContainer;
