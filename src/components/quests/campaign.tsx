import * as React from 'react';
import * as mui from '@mui/material';

// Typography
import {SubMainTitleText, SubtitleText, BodyText500} from '../../components/typography/typography';

// Types
import {type Campaign, type Quest, type CampaignDetailPageProps} from '../../types/quests/quest_types';
import {useNavigate} from 'react-router-dom';

// Services
import {getQuests} from '../../services/quests/quests';

// Helper function to convert hex to RGBA
const hexToRGBA = (hex: string, alpha: number) => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CampaignView: React.FC<Campaign> = props => {
	const navigate = useNavigate();

	const [quests, setQuests] = React.useState<Quest[]>([]);

	React.useEffect(() => {
		getQuests(props.id).then(quests => {
			setQuests(quests);
		}).catch(err => {
			console.log(err);
		});
	}, []);

	const testCampaignDetailPage: CampaignDetailPageProps = {
		campaign: props,
		quests,
	};

	return (
		<mui.Card sx={{display: 'flex', flexDirection: 'row', background: `linear-gradient(to right,${hexToRGBA(props.color, 0.5)} 10%,${hexToRGBA(props.color, 0.25)} 50%, #171717 70%)`, justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', width: '85%', borderRadius: 7, cursor: 'pointer', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out', // Smooth transition for transform and boxShadow
			'&:hover': {
				transform: 'translateY(-5px)', // Moves the card up by 5px
				boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Creates a shadow effect that gives the impression of levitation
			},
		}}
		onClick={() => {
			navigate('/quests', {state: testCampaignDetailPage});
		}}
		>
			<mui.Box sx={{display: 'flex', flexDirection: 'column', ml: '2%'}}>
				<SubMainTitleText sx={{color: '#fff', textShadow: '0 0 1px #FFF'}}>{props.title}</SubMainTitleText>
				<SubtitleText sx={{color: '#fff'}}>{props.subtitle}</SubtitleText>
			</mui.Box>
			<mui.CardContent sx={{textAlign: 'center', flexDirection: 'column'}}>
				<BodyText500 sx={{color: '#A3A3A3'}}>{props.description.part1}</BodyText500>
				<SubMainTitleText sx={{color: props.color, textShadow: `0 0 5px ${props.color}`}}>{props.description.main}</SubMainTitleText>
				<BodyText500 sx={{color: '#D2D2D2'}}>{props.description.part2}</BodyText500>
			</mui.CardContent>
			<img
				style={{width: '250px'}}
				src={props.box_image}
				alt='campaign image'
			/>
		</mui.Card>
	);
};

export default CampaignView;
