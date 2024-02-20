import * as mui from '@mui/material';
import {ArrowBack} from '@mui/icons-material';
import {useLocation} from 'react-router-dom';

const BackButton = () => {
	const path = useLocation().pathname;
	return (
		<mui.Button
			variant='contained'
			onClick={() => {
				window.history.back();
			}}
			sx={{
				width: '15%', bgcolor: 'transparent', boxShadow: 'none', mt: path == '/service_choice' ? '6%' : '',
			}}
		>
			<ArrowBack sx={{width: '30px', height: '30px', color: path == '/service_choice' ? '#000' : '#fff'}}/>
		</mui.Button>
	);
};

export default BackButton;
