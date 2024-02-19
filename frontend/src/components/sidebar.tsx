import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';

//images
import a_logo from '../assets/logo/a-icon.svg';

// material ui components
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';

//icons
import SwapHoriz from '@mui/icons-material/SwapHoriz';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LanguageIcon from '@mui/icons-material/Language';
import DropIcon from '@mui/icons-material/WaterDrop';

import LogoutDialog from './dialogs/logout';
import { useNavigate } from "react-router-dom";

import { open_url } from '../services/util/open';



const drawerWidth = 240;
const renderIcon = (index: number) => {
  switch (index) {
    case 0:
      return <img src={a_logo} alt="aleo logo" style={{ width: "40px", height: "40px", marginTop: '2%' }} />;
      break;
    case 1:
      return <SwapHoriz />;
      break;
    case 2:
      return <HistoryIcon />;
      break;
    /*
  case 3:
    return <InsertPhotoIcon />;
    break;
    */
    case 3:
      return <DropIcon />
      break;
    case 4:
      return <LanguageIcon />;
      break;
    case 5:
      return <SupportAgentRoundedIcon />;
      break;
    case 6:
      return <SettingsRoundedIcon />;
      break;
    case 7:
      return <LogoutIcon />;
      break;
    default:
      break;
  }
}


const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  color: "#111111",
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: "#111111",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});


interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {

  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    backgroundColor: "#111111",
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    color: "#111111",
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function SideMenu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [height, setHeight] = React.useState(window.innerHeight);
  const [logoutDialog, setLogoutDialog] = React.useState(false);

  const navigate = useNavigate();

  const md = useMediaQuery('(min-height:700px)');
  const lg = useMediaQuery('(min-height:1000px)');



  React.useEffect(() => {
    window.addEventListener("resize", () => setHeight(window.innerHeight));
  }, []);

  const handleOnClick = (index: Number) => {
    switch (index) {
      case 0:
        navigate("/home");
        break;
      case 1:
        navigate("/send");
        break;
      case 2:
        navigate("/activity")
        break;
      /*
    case 3:
      navigate("/nfts")
      break;
      */
      case 3:
        navigate("/browser", { state: "https://faucet.puzzle.online" })
        break;
      case 4:
        navigate("/browser")
        break;
      case 5:
        open_url("https://discord.gg/avail-1140618884764942386").then((res) => {
          console.log(res);
        }).catch((e) => {
          console.log(e);
        })
        break;
      case 6:
        navigate("/settings")
        break;
      case 7:
        setLogoutDialog(true);
        break;
      default:
        break;
    }
  }

  return (


    <Drawer variant="permanent" open={open} >
      <LogoutDialog isOpen={logoutDialog} onRequestClose={() => setLogoutDialog(false)} />
      <List >
        {['Home', 'Swap', 'Activity', 'Faucet', 'Browser', 'Support'].map((text, index) => (
          <ListItem key={text} disablePadding sx={{
            display: 'block', color: "#fff", marginTop: (text == 'Home') ? '' : "20%", transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out', // Smooth transition for transform and boxShadow
            '&:hover': {
              transform: (text == "Home") ? '' : 'translateY(-4px)',
              color: '#00FFAA'
            }
          }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                color: "#fff",
                '&:hover': {
                  color: '#00FFAA'
                }
              }}
              onClick={() => { handleOnClick(index); }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  marginTop: "3%",
                  color: 'inherit',
                }}

              >
                {renderIcon(index)}
              </ListItemIcon>
              <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
        {/*  <Box sx={{ mt: lg ? `${height / 2.5}px` : md ? `${height / 4}px` : `${height / 4}px` }} />*/}
        {['Settings', 'Logout'].map((text, index) => (
          <ListItem key={text} disablePadding sx={{
            display: 'block', color: "#111111", marginTop: "20%", transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out', // Smooth transition for transform and boxShadow
            '&:hover': {
              transform: 'translateY(-4px)',
              color: '#00FFAA'
            }
          }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                color: "#fff",
                '&:hover': {
                  color: '#00FFAA'
                }
              }}
              onClick={() => { handleOnClick(index + 6); }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  marginTop: "3%",
                  color: 'inherit',
                }}

              >
                {renderIcon(index + 6)}
              </ListItemIcon>
              <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}

      </List>


    </Drawer>
  );
}
