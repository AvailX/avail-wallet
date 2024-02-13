import * as mui from "@mui/material";
import * as React from "react";


interface FriendProps {
    name: string,
}

const FriendItem: React.FC<FriendProps> = ({ name }) => {
   const initial = name.charAt(0).toUpperCase();

   const displayName = name.length > 30 ? `${name.substring(0, 24)}...` : name;


    return(
        <mui.Box sx={{ display: 'flex', flexDirection: 'row', width: '90%', mt: '4%',p:'2%',alignItems:"center" }}>
          <mui.Avatar sx={{ bgcolor:  "#00ffaa", width: '45px', height: '45px', color: "#273344",mr:'10%' }}>{initial}</mui.Avatar>
          <mui.Typography sx={{color:'#fff',fontSize:"1.1rem",width:'100px'}}>
                {displayName}
          </mui.Typography>
        </mui.Box>     
    )
}

export default FriendItem;