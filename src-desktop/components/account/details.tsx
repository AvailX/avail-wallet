import * as mui from '@mui/material';

// Components

// icons
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Option from '../menu/options';
import logo from '../../assets/logo/a-icon.svg';

type DesignProperties = {
	address: string | undefined;
};

const options2 = [
	{
		title: 'Financial Statement',
		icon: DescriptionIcon,
		onClick() {
			console.log('statement');
		},
	},
	{
		title: 'Security and Privacy',
		icon: SecurityIcon,
		onClick() {
			console.log('security');
		},
	},
	{
		title: 'Settings',
		icon: SettingsIcon,
		onClick() {
			console.log('settings');
		},
	},
];

const Details: React.FC<DesignProperties> = ({address}) => {
	// Function to copy address to clipboard

	const handleCopyClick = () => {
		// Logic to copy the username to the clipboard
		const textArea = document.createElement('textarea');
		if (address !== undefined) {
			textArea.value = address;
		}

		document.body.append(textArea);
		textArea.select();
		document.execCommand('copy');
		textArea.remove();
	};

	return (
		<mui.Box sx={{
			display: 'flex', flexDirection: 'column', alignSelf: 'center', marginTop: '10%', width: '100%', marginBottom: '20%',
		}}>
			<mui.Typography sx={{fontSize: '1.2rem', color: '#fff'}}>
                Account Details
			</mui.Typography>
			<mui.Paper sx={{
				display: 'flex', flexDirection: 'column', background: 'linear-gradient( #273344, #0B1727);', p: '6%', borderRadius: '10px', marginTop: '2%',
			}}>
				<mui.Typography sx={{fontSize: '1rem', color: '#fff'}}>
                    Aleo Network Address
				</mui.Typography>
				<mui.Paper sx={{
					bgcolor: '#081424', display: 'flex', flexDirection: 'row', p: '2%', marginTop: '3%', justifyContent: 'space-between',
				}}>
					<mui.Box sx={{display: 'flex', flexDirection: 'column'}}>
						<mui.Typography sx={{color: '#fff', fontSize: '1rem'}}>
							{address?.slice(0, 34)}
						</mui.Typography>
						<mui.Typography sx={{color: '#fff', fontSize: '1rem'}}>
							{address?.slice(34, 58)}
						</mui.Typography>
					</mui.Box>
					<ContentCopyIcon sx={{
						width: '25px', height: '25px', color: '#fff', marginTop: '10%',
					}} onClick={() => {
						handleCopyClick();
					}}/>
				</mui.Paper>
			</mui.Paper>
			<mui.Paper sx={{
				display: 'flex', flexDirection: 'column', background: 'linear-gradient( #273344, #0B1727);', p: '6%', borderRadius: '10px', marginTop: '10%',
			}}>
				{
					options2.map((option, i) => (
						<>
							<Option
								key={option.title}
								title={option.title}
								Icon={option.icon}
								onClick={option.onClick} />
							<mui.Divider sx={{bgcolor: '#a3a3a3', m: '5%'}} key={i} />
						</>
					),
					)
				}
				<mui.Box sx={{
					display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5%',
				}} onClick={() => {
					console.log('avail');
				}}>
					<img src={logo} style={{width: '24px', height: '24px'}}/>
					<mui.Typography sx={{color: '#fff', fontSize: '1.1rem'}}>
                      About Us
					</mui.Typography>
				</mui.Box>
			</mui.Paper>
		</mui.Box>
	);
};

export default Details;
