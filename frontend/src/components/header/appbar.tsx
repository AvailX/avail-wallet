import * as React from 'react';
import * as mui from '@mui/material';

interface WrapperProps {
    children: React.ReactNode;
  }

const AvAppBar:React.FC<WrapperProps> = ({children}) => {

    const trigger = mui.useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
      });

    return(
        <mui.AppBar position="fixed" sx={{backgroundColor:!trigger?"transparent":mui.alpha("#a3a3a3",0.4),display:'flex',margin:0,padding:0,boxShadow:!trigger?"none":6,backdropFilter:!trigger?"none":"blur(10px)"}}>
            <mui.Toolbar sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'80px'}}>
                {children}
            </mui.Toolbar>
        </mui.AppBar>
    )
}

export default AvAppBar;