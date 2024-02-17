import * as React from "react";
import * as mui from "@mui/material";
import { SmallText400 } from "./typography/typography";

interface NftProps {
    name: string;
    image: string;
}

const Nft:React.FC<NftProps>=({name,image})=>{
    return (
        <mui.Box sx={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <img src={image} style={{width:100,height:100}} draggable={false}/>
        <SmallText400 sx={{color:'#fff'}}>{name}</SmallText400>
        </mui.Box>
    )
}

export default Nft;