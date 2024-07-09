import * as React from 'react';
import { styled } from '@mui/system';
import { Box } from '@mui/material';

const VerifiedBadgeWrapperContainer = styled(Box)({
  position: 'absolute',
  bottom: '1px',
  right: '5px',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  borderRadius: '50%',
  zIndex: 2,
});

const VerifiedBadge = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
});

interface VerifiedBadgeWrapperProps {
  src: string;
  alt: string;
}

const VerifiedBadgeWrapper: React.FC<VerifiedBadgeWrapperProps> = ({ src, alt }) => (
  <VerifiedBadgeWrapperContainer>
    <VerifiedBadge src={src} alt={alt} />
  </VerifiedBadgeWrapperContainer>
);

export default VerifiedBadgeWrapper;
