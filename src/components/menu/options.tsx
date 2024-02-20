import * as mui from '@mui/material';
import {type OverridableComponent} from '@mui/material/OverridableComponent';
import * as React from 'react';

type OptionProperties = {
	title: string;
	Icon: OverridableComponent<mui.SvgIconTypeMap<Record<string, unknown>>> & {
		muiName: string;
	};
	onClick: () => void;
};

const Option: React.FC<OptionProperties> = ({title, Icon, onClick}) => (
	<mui.Box sx={{
		display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5%',
	}} onClick={onClick}>
		<Icon sx={{color: '#00FFAA', width: '30px', height: '30px'}}/>
		<mui.Typography sx={{color: '#fff', fontSize: '1.1rem'}}>
			{title}
		</mui.Typography>
	</mui.Box>
);

export default Option;
