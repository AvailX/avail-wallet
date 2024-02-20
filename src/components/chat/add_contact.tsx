import * as mui from '@mui/material';
import * as React from 'react';

// Components
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchBar from '../searchabar';

// Icons

const AddContact: React.FC = () => (

	<mui.Paper
		sx={{
			p: 3,
			bgcolor: '#0b1423',
			mx: 'auto',
			border: 0,
			borderRadius: 3,
			width: '80%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		}}
	>
		<mui.Grid container gap={1}>
			<mui.Grid item>
				<PersonAddIcon sx={{color: '#75fbb1', fontSize: '30px'}} />
			</mui.Grid>
			<mui.Grid item>
				<mui.Typography
					fontWeight={300}
					color='white'
					sx={{
						fontSize: '1rem',
						pl: 0,
						width: '100%',
					}}
				>
                Add contact
				</mui.Typography>
			</mui.Grid>
		</mui.Grid>
		<SearchBar />
	</mui.Paper>

);

export default AddContact;
