import * as React from 'react';
import * as mui from '@mui/material';

// Components

// Typography
import {SubMainTitleText, SubtitleText, BodyText500} from '../../components/typography/typography';

// Types
import {type Campaign} from '../../types/quests/quest_types';

// Helper function to convert hex to RGBA
const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };


const CampaignView: React.FC<Campaign> = props => (

	<mui.Card sx={{display: 'flex', flexDirection: 'row', background: `linear-gradient(to top right,${hexToRGBA(props.color, 0.3)} 30%, transparent 60%)`, justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', width: '85%', p: 1, borderRadius: 7, cursor: 'pointer', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out', // Smooth transition for transform and boxShadow
    '&:hover': {
        transform: 'translateY(-5px)', // Moves the card up by 5px
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Creates a shadow effect that gives the impression of levitation
    },}}>
		<SubMainTitleText sx={{color: '#fff'}}>{props.title}</SubMainTitleText>
		<mui.CardContent sx={{textAlign: 'center', flexDirection: 'column'}}>
			<BodyText500 sx={{color: '#A3A3A3'}}>{props.description.part1}</BodyText500>
			<SubtitleText sx={{color: props.color, textShadow: `0 0 5px ${props.color}`}}>{props.description.main}</SubtitleText>
			<BodyText500 sx={{color: '#A3A3A3'}}>{props.description.part2}</BodyText500>
		</mui.CardContent>
		<img
			style={{width:'250px'}}
			src={props.box_image}
			alt='campaign image'
		/>
	</mui.Card>
);

export default CampaignView;
