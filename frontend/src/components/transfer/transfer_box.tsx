import * as mui from "@mui/material";
import * as React from "react";

//types
import { token,TokenProps} from "../../types/transfer_props/tokens";

//components
import TokenDropdown from "./token_dropdown";

//get token list from api

const TransferBox: React.FC<TokenProps> = ({tokens,token,amount,setToken,setAmount}) => {

    return(
      <mui.Box sx={{display:'flex',flexDirection:'row',p:'2px',borderRadius:'10px',border:'1px solid #FFF',bgcolor:'#3E3E3E',alignItems:'center',justifyContent:"space-between",height:'55px'}}>
      <mui.Box sx={{display:'flex',width:'100%',alignItems:'center'}}>
      {/* --Token Dropdown-- */}
        <TokenDropdown token={token} tokens={tokens} amount={amount} setToken={setToken} setAmount={setAmount}/>
       {/* --Vertical Divider-- */}
       <mui.Box sx={{display:'flex', alignItems:'center',justifyContent:'center',height:'100%'}}>
       <mui.Divider orientation={"vertical"} sx={{bgcolor:'#A3A3A3',marginTop:'1%',height:50,width:'1px',alignSelf:'center',marginLeft:'10px'}}/>
       </mui.Box>
       </mui.Box>
      {/* --Amount Input-- */}  
      <mui.Box sx={{display:'flex',width:'60%',alignItems:'center',justifyContent:'flex-end',pr:'8%'}}>
      <input
        type="number"
        value={amount || ""}
        autoFocus
     
        onChange={(e) => {
           if(Number(e.target.value) < 0){
              setAmount(0);
           }
            setAmount(Number(e.target.value));
        }}
        placeholder="0.00"
        style={{
            width: "90px",
            alignSelf: "center",
            backgroundColor: "#3E3E3E",
            borderRadius: '5px 5px 0px 0px',
            border: 'none',
            outline: 'none',
            color: "#fff", // Text color
            height:'50px',
            fontSize:'1.5rem',
        }}
        />
        </mui.Box>





      </mui.Box>
    )
}

export default TransferBox;