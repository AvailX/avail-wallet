import * as mui from "@mui/material";
import * as React from "react";

import { useNavigate } from "react-router-dom";

interface ContractItemProps {
    name: string,
    icon: string,
    deployed: boolean,
    path: string
}

const ContractItem: React.FC<ContractItemProps> = ({ name,icon,deployed,path }) => {
  const navigate = useNavigate();

    return(
        <mui.Box sx={{ display: 'flex', flexDirection: 'row', width: '90%', mt: '4%',p:'2%',alignItems:"center" }} onClick={()=>{navigate(path)}}>
          <img src={icon} style={{width:'12%',height:'auto',marginRight:'3%'}}/>      
          <mui.Typography sx={{color:deployed?'#00FFAA':'#fff',fontSize:"1.1rem",width:'80%'}}>
                {name}
          </mui.Typography>
        </mui.Box>     
    )
}

export default ContractItem;