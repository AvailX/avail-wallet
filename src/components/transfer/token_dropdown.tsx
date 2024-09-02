import {
  SelectChangeEvent,
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { type TokenProps, type token } from '../../types/transfer_props/tokens';

const TokenDropdown: React.FC<TokenProps> = ({ tokens, token, setToken }) => {
  const handleChange = (event: SelectChangeEvent) => {
    setToken(event.target.value);
  };

  return (
    <Box sx={{ width: '50%' }}>
      <FormControl fullWidth sx={{ outline: 'none', border: 0 }}>
        <Select
          labelId='demo-simple-select-label'
          id='demo-simple-select'
          defaultValue={token}
          value={token}
          label=''
          onChange={handleChange}
          sx={{
            outline: 'none',
            border: 0,
            height: '50px',
            '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
              // If you also want to remove the box-shadow for the focused state
              boxShadow: 'none',
            },
          }}
          inputProps={{
            MenuProps: {
              MenuListProps: {
                sx: {
                  backgroundColor: '#3E3E3E',
                },
              },
            },
          }}
        >
          {tokens.map((token: token, i) => (
            <MenuItem value={token.symbol} key={i} sx={{ bgcolor: '#3E3E3E' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  ml: '10%',
                  mt: '2%',
                }}
              >
                <img
                  src={token.image_url}
                  style={{ height: '25px', width: '25px' }}
                />
                <Typography sx={{ fontSize: '1rem', color: '#fff', mt: '' }}>
                  {token.symbol}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TokenDropdown;
