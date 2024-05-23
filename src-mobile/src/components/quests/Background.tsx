import * as React from 'react';
import { styled } from '@mui/system';
import { Box, BoxProps } from '@mui/material';

interface BackgroundProps extends BoxProps {
  bgImage: string;
}

const BackgroundContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgImage',
})<BackgroundProps>(({ bgImage }) => ({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '150px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}));

const Background: React.FC<BackgroundProps> = ({ bgImage, ...props }) => (
  <BackgroundContainer bgImage={bgImage} {...props} />
);

export default Background;
