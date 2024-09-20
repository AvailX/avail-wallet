import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import BackButton from '../buttons/back';
import { Box } from '@mui/material';

const ContractHeader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'center',
      justifyContent: 'space-between',
      alignItems: 'center',
      pt: '3%',
    }}
  >
    <BackButton />

    <Box
      sx={{
        width: '20%',
        display: 'flex',
        flexDirection: 'row',
        gap: '7%',
      }}
    >
      <DeleteIcon sx={{ width: '30px', height: '30px', color: '#fff' }} />
      <SaveAltIcon sx={{ width: '30px', height: '30px', color: '#fff' }} />
    </Box>
  </Box>
);

export default ContractHeader;
