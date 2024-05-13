import * as React from 'react';
import availLogo from '../assets/avail-logo.svg';

import {Box, Button, Typography} from '@mui/material';
import {type NavigateFunction, useNavigate} from 'react-router-dom';

const SignUp: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();

	return (
		<Box
      height='100vh'
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='space-between'
      sx={{ width: '100vw', m: 0, bgcolor: "#111111", p: 4 }}
		>
      <img src={availLogo} alt='avail-logo' style={{ paddingTop: "120px" }} />
      <Box sx={{ width: "100%", mt: -150 }}>
        <Button
          fullWidth
          onClick={(): void => navigate("")}
          sx={{
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
            py: 2,
          }}
          variant='contained'
          type='submit'
        >
          Create Wallet
        </Button>
        <Button sx={{ mt: 3 }} fullWidth variant='outlined'>
          Add an existing wallet
        </Button>
        <Typography variant='body1' mt={4} color='#9d9d9d' fontWeight={700}>
          By signing up you agree to Avail’s{" "}
          <span style={{ color: "#01f0a0" }}>
            Terms of Service and Privacy policy.
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;
