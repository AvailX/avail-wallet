import { Box } from '@mui/material';
import { BodyText500 } from '../../typography/typography';
import { FC } from 'react';

type PointsProps = {
  points: number;
  img_src: string;
};

const Point: FC<PointsProps> = ({ points, img_src }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      mt: '2%',
    }}
  >
    <Box component='img' src={img_src} sx={{ width: '40px', height: '40px' }} />
    <BodyText500 sx={{ color: '#FFF', ml: '5%' }}>{points}</BodyText500>
  </Box>
);

export default Point;
