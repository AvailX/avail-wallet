import * as React from 'react';
import * as mui from '@mui/material';



export default function CircularIndeterminate() {
    return (
      <mui.Box sx={{ display: '100%' }}>
        <mui.CircularProgress />
      </mui.Box>
    );
  }