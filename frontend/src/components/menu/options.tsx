import * as mui from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import * as React from "react";

interface OptionProps{
    title:string;
    Icon: OverridableComponent<mui.SvgIconTypeMap<{}, "svg">> & {
        muiName: string;
    };
    onClick:()=>void;
}

const Option: React.FC<OptionProps>  =({title,Icon,onClick})=>{
    return(
        <mui.Box sx={{display:'flex',flexDirection:'row',alignItems:'center',gap:'5%'}} onClick={onClick}>
          <Icon sx={{color:'#00FFAA',width:'30px',height:'30px'}}/>
          <mui.Typography sx={{color:'#fff',fontSize:'1.1rem'}}>
                {title}
          </mui.Typography>
         </mui.Box>
    )
}

export default Option;