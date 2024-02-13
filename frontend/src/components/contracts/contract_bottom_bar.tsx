import * as React from "react";
import * as mui from "@mui/material";



import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { useNavigate, useLocation } from "react-router-dom";

interface ContractBottomNavProps {
    viewCode: boolean,
    setViewCode: React.Dispatch<React.SetStateAction<boolean>>
}

const ContractBottomNav: React.FC<ContractBottomNavProps> = ({viewCode,setViewCode}) => {
   

    const navigate = useNavigate();

    return (
        <mui.Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#000', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',transition:'all 0.5s ease-in-out' ,alignItems:'center',pb:'4%'}} >
            <mui.Box sx={{ width: '30%' }} />


            <mui.Button
                variant="contained"
                autoCapitalize="false"
                sx={{ backgroundColor: '#00FFAA', width: '30%', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none', alignSelf: 'flex-end', mr: '4%' }}
                onClick={() => { }}
            >

                <mui.Typography sx={{ fontSize: '1.1rem', color: '#000', fontWeight: 450 }}>
                    Send
                </mui.Typography>
            </mui.Button>

            <mui.Box sx={{ display: 'flex', flexDirection: 'column',pr:'3%',height:'100%',justifyContent:'center',alignItems:'center' }}   onClick={() => { setViewCode(!viewCode) }}>
                <mui.Typography sx={{color:'#fff',fontSize:"0.7rem",mt:'5%',alignSelf:'center'}}>
                  View smart contract
                </mui.Typography>
                <mui.Button
                    variant="contained"
                    autoCapitalize="false"
                    sx={{ backgroundColor: '#273344', width: '50%', borderRadius: '30px', height:'20px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none', alignSelf: 'flex-end', mt: '10%', mr: '4%' }}
                  
                >
                    {viewCode ?
                        <ArrowDropUpIcon sx={{ color: '#fff' }}  />
                        :
                        <ArrowDropDownIcon sx={{ color: '#fff' }}  />
                    }

                </mui.Button>
            </mui.Box>
        </mui.Paper>
    )
}

export default ContractBottomNav;