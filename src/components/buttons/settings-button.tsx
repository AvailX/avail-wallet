import * as React from 'react';
import Button from '@mui/material/Button';
import {styled} from '@mui/material/styles';
import {BodyText500, SmallText400} from '../typography/typography';
import {useScan} from '../../context/ScanContext';

type CtaButtonProperties = {
	text: string;
	onClick?: () => void;
};

const SettingButton = styled(Button)({
	backgroundColor: '#00FFAA',
	color: '#111111',
	fontWeight: 'bold',
	padding: '8px 15px',
	borderRadius: '10px',
	transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
	textTransform: 'none',
	'&:hover': {
		backgroundColor: '#00FFAA',
		boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
		transform: 'scale(1.03)',
	},
	'&:focus': {
		backgroundColor: '#00FFAA',
		boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
	},
	width: '20%',
	alignSelf: 'center',
	height: '40px',

});

export default function STButton({text, onClick}: CtaButtonProperties) {
	const {scanInProgress, startScan, endScan} = useScan();

	const isDisabled = (parameter: string) => {
		if (parameter == 'Full ReSync' && scanInProgress) {
			return true;
		}

		return false;
	};

	return <SettingButton onClick={onClick} disabled={isDisabled(text)} sx={{
		ml: '2%', mt: '2%', bgcolor: (text === 'Delete Account') ? '#D21C1C' : '#00FFAA', '&:hover': {bgcolor: (text === 'Delete Account') ? '#D21C1C' : '#00FFAA'}, '&:focus': {bgcolor: (text === 'Delete Account') ? '#D21C1C' : '#00FFAA'},
	}}>
		<SmallText400>{text}</SmallText400>
	</SettingButton>;
}
