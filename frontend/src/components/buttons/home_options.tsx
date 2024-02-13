import * as mui from "@mui/material";
import * as React from "react";

//icons
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import DescriptionIcon from '@mui/icons-material/Description';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import { alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomeOptions = () => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const navigate = useNavigate();

    return(
        <mui.Box sx={{ display: 'flex', flexDirection: "row", alignItems: 'center',marginTop:'15%',justifyContent:'space-between' }}>
        <mui.Button
            variant="contained"
            autoCapitalize="false"
            onClick={() => { navigate("/send") }}
            sx={{ backgroundColor: alpha('#3A3A3A',0.4), width: '35%', borderRadius: '30px', minHeight: '50px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none' }}>
            <mui.Box sx={{ display: 'flex', flexDirection: "row", alignItems: 'center' }}>
            <mui.Typography sx={{ fontSize: '1.1rem', color: '#ff', fontWeight: 500 }}>
                Send
            </mui.Typography>
            <ArrowUpwardIcon sx={{ color: '#fff',width:'24px',height:'24px',marginLeft:'5px'}}/>
            </mui.Box>
        </mui.Button>
        <mui.Button
            variant="contained"
            autoCapitalize="false"
            sx={{ backgroundColor: alpha('#3A3A3A',0.4), width:'40%', borderRadius: '30px', minHeight: '50px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none' }}>
            <mui.Box sx={{ display: 'flex', flexDirection: "row", alignItems: 'center' }}>
            <mui.Typography sx={{ fontSize: '1.1rem', color: '#ff', fontWeight: 500 }}>
                Receive
            </mui.Typography>
            <ArrowDownwardIcon sx={{ color: '#fff',width:'24px',height:'24px',marginLeft:'5px'}}/>
            </mui.Box>
        </mui.Button>
        <mui.Button
            variant="contained"
            autoCapitalize="false"
            onClick={handleClick}
            sx={{ backgroundColor: alpha('#3A3A3A',0.4), width: '10%', borderRadius: '90px', minHeight: '50px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none' }}>
            <MoreHorizIcon sx={{ color: '#fff',width:'26px',height:'26px'}}/>
        </mui.Button>
        <mui.Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <mui.MenuItem onClick={()=>{navigate('/contracts')}}>
          <mui.ListItemIcon>
            <DescriptionIcon fontSize="medium" />
          </mui.ListItemIcon>
          Contracts
        </mui.MenuItem>
        <mui.MenuItem onClick={handleClose}>
          <mui.ListItemIcon>
            <CurrencyExchangeIcon fontSize="medium" />
          </mui.ListItemIcon>
         Swap
        </mui.MenuItem>
        <mui.MenuItem onClick={handleClose}>
          <mui.ListItemIcon>
            <CreditCardIcon fontSize="medium" />
          </mui.ListItemIcon>
          Cards
        </mui.MenuItem>
      </mui.Menu>
    </mui.Box>
    )
}

export default HomeOptions;