import {Box, Button, Typography} from '@mui/material';

import backupHand from '../assets/backup-hand.png';

const BackupWallet = () => {
  return (
    <Box
      pt={16}
      px={3}
      position='relative'
      height='100vh'
      bgcolor='#111111'
      color='#fff'
    >
      <Typography
        fontSize='60px'
        textAlign='center'
        fontWeight={700}
        lineHeight='60px'
        color='#fff'
      >
        <span style={{ color: "#00FFAA" }}>Back up </span>
        your wallet
      </Typography>

      <Typography
        textAlign='center'
        mt={3}
        fontSize='18px'
        lineHeight='20.88px'
      >
        If you ever lose access to your account, you'll need your secret
        recovery phrase to recover your crypto.{" "}
        <span style={{ color: "#00FFAA" }}>Never share it with anyone.</span>
      </Typography>

      <Box
        mx='auto'
        display='flex'
        alignItems='center'
        justifyContent='center'
        mt={8}
      >
        <img src={backupHand} width='166px' />
      </Box>

      <Box
        width='100%'
        position='absolute'
        p={2}
        left={0}
        bottom={50}
        height='auto'
        zIndex={10}
      >
        <Button
          fullWidth
          sx={{
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
            py: 2,
          }}
          variant='contained'
          type='submit'
        >
          Reveal Phrase
        </Button>
        <Button
          sx={{ mt: 3, bgcolor: "#3E3E3E !important" }}
          fullWidth
          variant='outlined'
        >
          Skip
        </Button>
      </Box>
    </Box>
  );
};

export default BackupWallet;
