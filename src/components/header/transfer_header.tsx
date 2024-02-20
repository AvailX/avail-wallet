import * as mui from '@mui/material';
import * as React from 'react';
import '../../styles/shapes.css';
import {getInitial} from '../../services/states/utils';
import SearchBar from '../searchabar';
import {useNavigate} from 'react-router-dom';

const TransferHeader = () => {
	const navigate = useNavigate();
	const [initial, setInitial] = React.useState<string | undefined>('');

	React.useEffect(() => {
		getInitial(setInitial);
	}, []);

	return (
		<mui.Box sx={{
			display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', alignItems: 'center', width: '95%',
		}}>
			<mui.Box className='hex2' onClick={() => {
				navigate('/account');
			}}>
				<mui.Typography sx={{color: '#000', fontSize: '1.1rem'}}>
					{initial}
				</mui.Typography>
			</mui.Box>
			<mui.Box sx={{width: '80%'}}>
				<SearchBar/>
			</mui.Box>

		</mui.Box>
	);
};

export default TransferHeader;
