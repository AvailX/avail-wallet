import { SvgIconTypeMap, Box, Typography } from '@mui/material';
import { type OverridableComponent } from '@mui/material/OverridableComponent';

type OptionProperties = {
  title: string;
  Icon: OverridableComponent<SvgIconTypeMap<Record<string, unknown>>> & {
    muiName: string;
  };
  onClick: () => void;
};

const Option: React.FC<OptionProperties> = ({ title, Icon, onClick }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '5%',
    }}
    onClick={onClick}
  >
    <Icon sx={{ color: '#00FFAA', width: '30px', height: '30px' }} />
    <Typography sx={{ color: '#fff', fontSize: '1.1rem' }}>{title}</Typography>
  </Box>
);

export default Option;
