import { Box, Typography } from '@mui/material';

const Balance = ({ props }: { props: { balance: number } }) => {
  // Format number so that every 3 digits is seperated by a comma
  const formatNumber = (number_: number) => {
    // Round the number to 2 decimal places
    number_ = Math.round((number_ + Number.EPSILON) * 100) / 100;
    return number_.toString().replaceAll(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  const balance = formatNumber(props.balance);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'right' }}>
      <Typography sx={{ color: '#00FFAA', fontSize: '2.7rem' }}>
        ${balance}
      </Typography>
    </Box>
  );
};

export default Balance;
