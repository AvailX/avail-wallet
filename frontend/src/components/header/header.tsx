import * as mui from "@mui/material";
import * as React from "react";
import "../../styles/shapes.css";

import { getInitial } from "../../services/states/utils";

//icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useNavigate,useLocation } from "react-router-dom";
const Header = () => {
    const navigate = useNavigate();
    const [initial, setInitial] = React.useState<string | undefined>("");
    
    React.useEffect(()=>{
        getInitial(setInitial);
    },[])
    
    const path = useLocation().pathname;

    return(
              <mui.Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', alignItems: 'center', width: '90%'}}>
              <mui.Box className={path=='/contracts'? 'hex2':"hex1"} onClick={()=>navigate('/account')}>
              <mui.Typography sx={{ color: path=='/contracts'? '#081424':'#00FFAA', fontSize: '1.2rem',fontWeight:'700px'}}>
                 {initial}
              </mui.Typography>
              </mui.Box>
              <mui.Box sx={{display:'flex',flexDirection:'row',gap:'17%'}}>
                  <NotificationsIcon sx={{ width: '30px', height: '30px', color: path=='/contracts'? '#fff':'#081424'}} onClick={()=>navigate('/notifications')}/>
                  {path !== '/transfer' &&
                  <QrCodeScannerIcon sx={{ width: '30px', height: '30px', color: path=='/contracts'? '#fff':'#081424' }} />
                    }
                  </mui.Box>

          </mui.Box>
    )
}

export default Header;