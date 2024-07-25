import React from 'react';
import {
	Box, Switch, Typography, styled,
} from '@mui/material';
import {useTranslation} from 'react-i18next';

// Custom styled switch
const CustomSwitch = styled(Switch)(({theme}) => ({
	'& .MuiSwitch-switchBase.Mui-checked': {
		color: '#00FFAA',
		'&:hover': {
			backgroundColor: 'rgba(0, 255, 170, 0.08)',
		},
	},
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
		backgroundColor: '#00FFAA',
	},
	'& .MuiSwitch-track': {
		backgroundColor: '#777',
	},
}));

type ToggleRowProperties = {
	label: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type SettingsProperties = {
	onTransferFromToggle: (checked: boolean) => void;
	onTransferToToggle: (checked: boolean) => void;
	onFeeToggle: (checked: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProperties> = ({label, checked, onChange}) => (
	<Box sx={{
		display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '1%',
	}}>
		<Typography sx={{color: '#FFF', fontWeight: 'bold', fontSize: '1rem'}}>
			{label}
		</Typography>
		<CustomSwitch checked={checked} onChange={onChange} />
	</Box>
);

const SettingsComponent: React.FC<SettingsProperties> = ({onTransferFromToggle, onTransferToToggle, onFeeToggle}) => {
	const [isPrivateTransferFrom, setIsPrivateTransferFrom] = React.useState(false);
	const [isPrivateTransferTo, setIsPrivateTransferTo] = React.useState(false);
	const [isPrivateFee, setIsPrivateFee] = React.useState(false);

	const {t} = useTranslation();

	return (
		<Box sx={{
			display: 'flex', flexDirection: 'column', width: '85%', alignSelf: 'center', ml: '2%', mt: '2%',
		}}>
			<ToggleRow
				label= {isPrivateTransferFrom ? t('send.privacy-toggles.from-private') : t('send.privacy-toggles.from-public')}
				checked={isPrivateTransferFrom}
				onChange={e => {
					setIsPrivateTransferFrom(e.target.checked);
					onTransferFromToggle(e.target.checked);
				}}
			/>
			<ToggleRow
				label={isPrivateTransferTo ? t('send.privacy-toggles.to-private') : t('send.privacy-toggles.to-public')}
				checked={isPrivateTransferTo}
				onChange={e => {
					setIsPrivateTransferTo(e.target.checked);
					onTransferToToggle(e.target.checked);
				}}
			/>
			<ToggleRow
				label={isPrivateFee ? t('send.privacy-toggles.private-fee') : t('send.privacy-toggles.public-fee')}
				checked={isPrivateFee}
				onChange={e => {
					setIsPrivateFee(e.target.checked);
					onFeeToggle(e.target.checked);
				}}
			/>
		</Box>
	);
};

export default SettingsComponent;
