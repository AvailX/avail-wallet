import { SubtitleText } from '../../typography/typography';

import { type PointsResponse } from '../../../types/quests/quest_types';
import Point from './point';
import InfoTooltip from '../../../components/tooltips/info';
import { Box } from '@mui/material';
import { FC } from 'react';

type PointsProps = {
  points: PointsResponse[];
};

const message =
  "Created to reward the early supporter's of Avail Wallet. The top contributors and supporters in our early days will be rewarded with multiple airdrops.";

const Points: FC<PointsProps> = ({ points }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #171717 10%, #0C6446 90%)',
      alignSelf: 'flex-end',
      width: '20%',
      pl: 2,
      pt: 1,
      pb: 1,
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <SubtitleText sx={{ color: '#B2B2B2' }}>Points</SubtitleText>
      <InfoTooltip message={message} />
    </Box>
    {points.map((point) => (
      <Point
        key={point.img_src}
        points={point.points}
        img_src={point.img_src}
      />
    ))}
  </Box>
);

export default Points;
