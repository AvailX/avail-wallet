import * as mui from "@mui/material";
import * as React from "react";

import AddContact from "./add_contact";

import { useNavigate } from "react-router-dom";
import FriendItem from "./friend";
import { ArrowBack } from "@mui/icons-material";

interface NewTransferProps {
    state: React.Dispatch<React.SetStateAction<boolean>>
}

const NewTransfer: React.FC<NewTransferProps> = ({state}) => {
    const [address,setAddress]= React.useState<string>("");
    const navigate = useNavigate();

    // fetch your avail friends from database

    const test_friends =["Jack","SteveX","Miura","aleo1r3uwnl6gnhhg5jqk5ktfsay05hurr765xsv545mhnpytgw3puyzq0xyyz3"]
    
    return(
        <mui.Box sx={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',height:'90%',borderRadius:'0px 10px 10px 0px',bgcolor:'#273344',mt:'20%'}}>
         
         <mui.Button
                variant="contained"
                onClick={() => {
                   state(false);
                }}
                sx={{width: "15%",bgcolor:'transparent',boxShadow:'none',alignSelf:'flex-start',p:'4%'}}
            >
                <ArrowBack  sx={{width:'30px',height:'30px'}}/>
        </mui.Button>
         <AddContact/>
        
            <mui.Box sx={{display:'flex',flexDirection:'column',p:'3%',bgcolor:'#081424',mt:'5%',borderRadius:"10px",width:'85%'}}>
                <mui.Typography sx={{ fontSize: '1.1rem', color: '#fff' }}>
                    Send directly to an Aleo address.
                </mui.Typography>
                <mui.TextField
                id="address"
                label="Address"
                variant="filled"
                onChange={(e) => { setAddress(e.target.value); }}
                value={address}
            
                color="primary"
                sx={{
                width: "95%",
                alignSelf: "center",
                marginTop: '6%',
                backgroundColor: mui.alpha("#49454F", 0.35),
                borderRadius: '5px 5px 0px 0px',
                borderBottom:'solid 1px #E0E3E7',
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                    borderColor: '#E0E3E7',
                    }
                }
                }}
                inputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
              />
               <mui.Button
                    variant="contained"
                    autoCapitalize="false"
                    sx={{ backgroundColor: '#00FFAA', width: '25%', borderRadius: '30px', height: '40px', display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', textTransform: 'none',alignSelf:'flex-end',mt:'15%' }}
                    onClick={() => {navigate('/send')}}
                >
                    <mui.Typography sx={{ fontSize: '1.1rem', color: '#000', fontWeight: 450 }}>
                        Send
                    </mui.Typography>
                </mui.Button>
            </mui.Box>
       
         <mui.Box sx={{display:'flex',flexDirection:'column',bgcolor:'#081424',width:'80%',mt:'10%',borderRadius:"10px",p:'5%',mb:'5%'}}>
         <mui.Typography sx={{ fontSize: '1rem', color: '#fff',alignSelf:'flex-start' }}>
            Avail Friends
         </mui.Typography>
         
          {test_friends.map(friend => (
                    <FriendItem name={friend} />
                ))
          }
          </mui.Box>
        </mui.Box>
    );
}

export default NewTransfer;