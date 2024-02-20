import * as mui from '@mui/material';
import BackButton from '../buttons/back';
import AvAppBar from './appbar';

type WrapperProperties = {
	title: string;
};

const SimpleAvAppBar: React.FC<WrapperProperties> = ({title}) => {
	const trigger = mui.useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
	});

	return (
		<AvAppBar>
			<mui.Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					width: '100%',
					alignSelf: 'center',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<BackButton />
				{trigger
            && <mui.Typography sx={{color: '#00FFAA', fontSize: '1.1rem'}}>
            	{title}
            </mui.Typography>
				}
				<mui.Box sx={{width: '15%'}} />
			</mui.Box>
		</AvAppBar>
	);
};

export default SimpleAvAppBar;
