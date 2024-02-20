import React from 'react';
import {Box, Typography, Avatar} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

// Define the props for the BalanceInfo component
type BalanceInfoProperties = {
	privateAmount: number;
	publicAmount: number;
};

const BalanceInfo: React.FC<BalanceInfoProperties> = ({privateAmount, publicAmount}) => (
	<Box
		sx={{
			display: 'flex',
			justifyContent: 'space-around',
			alignItems: 'center',
			width: '30%', // Set the width as needed
			bgcolor: 'inherit', // Background color
			color: 'white', // Text color
			borderRadius: '16px', // Adjust as needed
			padding: '5px', // Adjust as needed
			ml: '2.5%',
		}}
	>
		<Box sx={{width: '1px', height: '60px', bgcolor: 'grey.700'}} />
		{/* Private balance */}
		<Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
			<Avatar sx={{bgcolor: 'transparent'}}>
				<LockIcon sx={{color: '#00FFAA'}} />
			</Avatar>
			<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Typography variant='subtitle2' gutterBottom>
          Private
				</Typography>
				<Typography variant='h6'>{privateAmount}</Typography>
			</Box>
		</Box>
		{/* Divider - Optional visual separation between elements */}

		{/* Public balance */}
		<Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
			<Avatar sx={{bgcolor: 'transparent'}}>
				<PublicIcon sx={{color: '#00FFAA'}}/>
			</Avatar>
			<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

				<Typography variant='subtitle2' gutterBottom>
            Public
				</Typography>
				<Typography variant='h6'>{publicAmount}</Typography>
			</Box>
		</Box>
	</Box>
);

export default BalanceInfo;
