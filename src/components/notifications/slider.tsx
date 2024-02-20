import * as React from 'react';
import * as mui from '@mui/material';
import Notification from './notification';
import {type NotificationProps} from '../../types/notification';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const NotificationSlider: React.FC<{notifications: NotificationProps[]}> = ({notifications}) => {
	const responsive = {
		superLargeDesktop: {
			// The naming can be any, depends on you.
			breakpoint: {max: 4000, min: 3000},
			items: 5,
		},
		desktop: {
			breakpoint: {max: 3000, min: 1024},
			items: 3,
		},
		tablet: {
			breakpoint: {max: 1024, min: 464},
			items: 2,
		},
		mobile: {
			breakpoint: {max: 464, min: 0},
			items: 1,
		},
	};

	return (
		<Carousel
			swipeable={true}
			draggable={false}
			showDots={false}
			responsive={responsive}
			infinite={true}
			autoPlay={true}
			autoPlaySpeed={10_000}
			customTransition='all .5'
			transitionDuration={500}
			containerClass='carousel-container'
			renderDotsOutside={true}
			removeArrowOnDeviceType={['tablet', 'mobile']}

		>
			{notifications.map(notification => (
				<Notification {...notification} key={notification.id} />
			))}
		</Carousel>
	);
};

export default NotificationSlider;
