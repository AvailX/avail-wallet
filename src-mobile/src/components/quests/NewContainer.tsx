import * as React from 'react';
import { styled } from '@mui/system';
import { Box, Typography } from '@mui/material';

interface NewContainerProps {
  title: string;
  description: string;
  bgImage: string;
}

const NewContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgImage',
})<{ bgImage: string }>(({ bgImage }) => ({
  height: '200px',
  width: '95%',
  position: 'relative',
  margin: '20px auto',
  backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  borderRadius: '11px',
}));

const NewContainerText = styled(Box)({
  marginLeft: '10px',
});

const NewContainer: React.FC<NewContainerProps> = ({ title, description, bgImage }) => (
  <NewContainerBox bgImage={bgImage}>
    <NewContainerText>
      <Typography fontSize={'13px'} fontWeight={'bold'}>
        {title}
      </Typography>
      <Typography fontSize={'12px'}>{description}</Typography>
    </NewContainerText>
  </NewContainerBox>
);

export default NewContainer;
