import * as React from 'react';
import * as mui from '@mui/material';

import {SubtitleText} from '../../typography/typography';

import {type PointsResponse} from '../../../types/quests/quest_types';
import Point from './point';

type PointsProps = {
	points: PointsResponse[];
};

const Points: React.FC<PointsProps> = ({points}) => (
	<mui.Box sx={{display: 'flex', flexDirection: 'column', borderRadius: '20px', background: 'linear-gradient(135deg, #171717 10%, #0C6446 90%)', alignSelf: 'flex-end', width: '20%', pl: 2, pt: 1, pb: 1}}>
		<SubtitleText sx={{color: '#B2B2B2'}}>Points</SubtitleText>
		{points.map(point => (
			<Point key={point.img_src} points={point.points} img_src={point.img_src} />
		))}
	</mui.Box>
);

export default Points;