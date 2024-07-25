import * as React from 'react';
import * as mui from '@mui/material';
import {ArrowBackIos} from '@mui/icons-material';

import {useNavigate} from 'react-router-dom';
import AvailTextField from '../../components/texfields/AvailTextField';

function PrivateKeyLogin() {
  const navigate = useNavigate();

  return (
    <mui.Grid
      container
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        backgroundSize: "cover",
        backgroundColor: "#000000",
      }}
    >
      {/* Arrow back icon */}
      <mui.Grid
        item
        xs={12}
        sx={{
          position: "absolute",
          top: "50px",
          left: "10px",
          zIndex: "1000",
        }}
      >
        <mui.IconButton
          onClick={() => navigate(-1)}
          sx={{
            pr: "2px",
            color: "lightgray",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "gray",
          }}
        >
          <ArrowBackIos />
        </mui.IconButton>
      </mui.Grid>

      {/* The Text in a Column */}
      <mui.Grid item xs={12} textAlign="center" mt={0}>
        <mui.Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#01f0a0" }}
        >
          Input Private Key
        </mui.Typography>
        <mui.Typography
          variant="body1"
          sx={{ color: "#9d9d9d", textAlign: "center" }}
        >
          Input your Private key to access your <br />
          crypto in avail wallet
        </mui.Typography>
      </mui.Grid>

      {/* The Text Field and eye outline icon */}
      <mui.Grid item xs={12} textAlign="center" mt={-20}>
        <AvailTextField isPassword={true} />
      </mui.Grid>

      {/* The Next button */}
      <mui.Grid item xs={12} textAlign="center" mt={10}>
        <mui.Button
          variant="contained"
          size="large"
          onClick={() => navigate("/username-select-screen")}
          sx={{
            fontSize: "20px",
            padding: "12px 140px",
            background:
              "linear-gradient(89.89deg, #3E3E3E -27.59%, rgba(62, 62, 62, 0) 42.72%), #00FFAA",
          }}
        >
          Continue
        </mui.Button>
      </mui.Grid>
    </mui.Grid>
  );
}

export default PrivateKeyLogin;