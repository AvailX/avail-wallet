import * as React from 'react';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import {Box} from '@mui/material';
import Tooltip, {type TooltipProps, tooltipClasses} from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const HtmlTooltip = styled(({className, ...props}: TooltipProps) => (
	<Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: '#1E1D1D',
		color: '#fff',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(15),
	},
}));

type InfoTooltipProps = {
	message: React.ReactNode; // Allows for string, JSX, or any React node as a message
};

export default function InfoTooltip({message}: InfoTooltipProps) {
	return (
		<HtmlTooltip
			title={
				<React.Fragment>
					<Typography color='inherit'>Avail Points</Typography>
					{message}
				</React.Fragment>
			}
		>
			<IconButton
				sx={{
					borderRadius: '50%',
					backgroundColor: 'transparent',
					color: '#a3a3a3',
					width: 48,
					height: 48,
					padding: 0,
				}}
			>
				<InfoOutlinedIcon />
			</IconButton>
		</HtmlTooltip>
	);
}
