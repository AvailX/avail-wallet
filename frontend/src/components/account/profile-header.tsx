import * as React from 'react';
import * as mui from "@mui/material";

//components
import Option from "../menu/options";

//styles
import "../../styles/shapes.css";

//icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import logo from '../../assets/logo/a-icon.svg'
import { SmallText } from "../typography/typography";

//alerts
import { SuccessAlert,ErrorAlert } from "../snackbars/alerts";

interface DesignProps {
    address: string | undefined;
    name: string | undefined;
}

const ProfileBar: React.FC<DesignProps> = ({ address,name }) => {
    const [success , setSuccess] = React.useState(false);
    const [error , setError] = React.useState(false);
    const [message , setMessage] = React.useState("");

    //function to copy address to clipboard
    const handleCopyClick = () => {
        // Logic to copy the username to the clipboard
        const textArea = document.createElement('textarea');
        if(address !== undefined){
            textArea.value = address;
        }
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // update alert
        setMessage("Address copied to clipboard!");
        setSuccess(true);
    };

    const handleCopyClickUsername = () => {
        // Logic to copy the username to the clipboard
        const textArea = document.createElement('textarea');
        if(name !== undefined){
            textArea.value = name;
        }
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // update alert
        setMessage("Username copied to clipboard!");
        setSuccess(true);
    };

    const shortAddress = address?.slice(0, 12)+ "...";

    const md = mui.useMediaQuery('(min-width:1000px)');
    const lg = mui.useMediaQuery('(min-width:1200px)');

    return (
        <>
        <SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
        <ErrorAlert errorAlert={error} setErrorAlert={setError} message={message}/>
        <mui.Box sx={{display:'flex',flexDirection:'row',height:"35px", width:md?"20%":"30%", background: '#3E3E3E',borderRadius: 12,alignItems:'center'}}>
            <mui.IconButton onClick={()=>{handleCopyClick()}}sx={{ width: '17px', height: '17px', color: '#fff',align:"left", marginLeft:"4%",cursor:'pointer',p:'2%' }}>
            <ContentCopyIcon sx={{width: '17px', height: '17px','&:hover':{color:'#00FFAA'}}} />
            </mui.IconButton>
            <SmallText sx={{color:"#fff",ml:'7%'}}>
                {shortAddress}
            </SmallText>
            <mui.Box className="hex2" sx={{ml:'2%',cursor:'pointer'}} onClick={()=>handleCopyClickUsername()}>
              <mui.Typography sx={{ color: '#000', fontSize: '1rem'}} >
                 {name?.charAt(0).toUpperCase()}
              </mui.Typography>
              </mui.Box>
        </mui.Box>
        </>
   )
}

export default ProfileBar;
