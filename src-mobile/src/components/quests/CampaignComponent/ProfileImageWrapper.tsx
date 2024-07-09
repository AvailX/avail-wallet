import * as React from 'react';
import { styled } from '@mui/system';
import { Box } from '@mui/material';

const ProfileImageWrapperContainer = styled(Box)({
  position: 'relative',
  width: '130px',
  height: '130px',
  borderRadius: '50%',
  border: '0.6px solid #01f0a0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  zIndex: 1,
});

const ProfileImage = styled('img')({
  width: '88%',
  height: '88%',
  borderRadius: '50%',
});

interface ProfileImageWrapperProps {
  src: string;
  alt: string;
}

const ProfileImageWrapper: React.FC<ProfileImageWrapperProps> = ({ src, alt }) => (
  <ProfileImageWrapperContainer>
    <ProfileImage src={src} alt={alt} />
  </ProfileImageWrapperContainer>
);

export default ProfileImageWrapper;
