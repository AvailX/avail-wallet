import * as React from 'react';
import * as mui from '@mui/material';

import {BodyText500} from '../../typography/typography';

type PointsProps = {
	points: number;
	img_src: string;
};

const Point: React.FC<PointsProps> = ({points, img_src}) => (
	<mui.Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: '2%'}}>
		<mui.Box
			component='img'
			src={img_src}
			sx={{width: '40px', height: '40px'}}
		/>
		<BodyText500 sx={{color: '#FFF', ml: '5%'}}>{points}</BodyText500>
	</mui.Box>
);

export default Point;
