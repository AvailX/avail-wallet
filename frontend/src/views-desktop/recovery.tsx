import * as React from 'react';
import * as mui from '@mui/material';

//components
import Layout from './reusable/layout';
import SimpleAvAppBar from '../components/header/simple_appbar';
import CTAButton from '../components/buttons/cta';
import WhiteHueTextField from '../components/textfields/white-hue';
import Divider from '@mui/material/Divider';
import SecureButton from '../components/buttons/secure-button';
import LanguageSelector from '../components/select/language';

//images
import full_logo from "../assets/logo/full-logo.svg";

//services
import { checkBiometrics } from '../services/authentication/register';
import { recover } from '../services/recovery/phrase';

//typography
import { Title2Text,SubtitleText, BodyText } from '../components/typography/typography';

//icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowForward from '@mui/icons-material/ArrowForward';

//images
import a_logo from "../assets/logo/a-icon.svg";

//alerts
import { SuccessAlert,ErrorAlert } from '../components/snackbars/alerts';

import { useTranslation } from 'react-i18next';

//Hooks
import { useNavigate } from 'react-router-dom';
import { Languages } from '../types/languages';


const Recovery =()=> {
    const md = mui.useMediaQuery('(min-width:1000px)');
    const lg = mui.useMediaQuery('(min-width:1200px)');
  

    const [seedEven,setSeedEven] = React.useState<string[]>([' ',' ',' ',' ',' ',' ']);
    const [seedOdd,setSeedOdd] = React.useState<string[]>([' ',' ',' ',' ',' ',' ']);

    const [password,setPassword] = React.useState<string>('');
    const [passwordHidden,setPasswordHidden] = React.useState<boolean>(true);
    const [confirmPassword,setConfirmPassword] = React.useState<string>('');
    const [confirmPasswordHidden,setConfirmPasswordHidden] = React.useState<boolean>(true);

    const [isSecureAccountVisible, setIsSecureAccountVisible] = React.useState(false);
   
    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const {t} = useTranslation();

    const [isLoading, setIsLoading] = React.useState(false);
    //biometricAvail is to check if user can use biometrics
    const [biometricAvail,setBiometricAvail] = React.useState<boolean>(false);
    const [biometric, setBiometric] = React.useState<boolean>(false);
    const [seed,setSeed] = React.useState<string>('');
    const [language,setLanguage] = React.useState<Languages>(Languages.English);

    // initialize a 12 element array of objects
    const [mockSeed, setMockSeed] = React.useState<String[]>([' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']);

    const navigate = useNavigate();

    const handleOrdering =()=>{
       
      console.log(mockSeed)
       const seed_phrase = mockSeed.join(' ');
       //recover
       console.log(seed_phrase);
       setSeed(seed_phrase);


       // Simulate loading with a timeout
       setTimeout(() => {
           setIsLoading(false); // Hide loading indicator
           setIsSecureAccountVisible(true);
       }, 1500); // You can adjust the timeout duration
    }

    return(
        <Layout>
           {!isSecureAccountVisible && (
            <>
           <img src={a_logo} alt="aleo logo" style={{width:"60px", height:"60px", marginTop:"20px", marginLeft:"20px",cursor:'pointer'}} onClick={()=>  window.history.back()}/>
        <mui.Box sx={{width:'85%',alignSelf:'center'}}>
        <Title2Text sx={{color:'#FFF'}}>{t("recover.title")}</Title2Text>
        </mui.Box>
        <mui.Grid container spacing={1} sx={{ marginTop:"25px",alignSelf:'center',bgcolor:'#1E1D1D',borderRadius:'10px',width:'85%',padding:'5%',justifyContent:'center',mb:'2%',alignItems:'center',position:'relative'}}>
    

      {/* Secret words grid items */}
            {mockSeed?.map((word, index) => 
               (
                    <mui.Grid 
                    key={index}
                    sx={{color:"#fff",m:'2%',borderRadius:'10px',padding:'1%',textAlign:'center'}}
                    item
                    xs={3} // Adjust the grid size as needed
                    >  
                <WhiteHueTextField
                key={index}
                label={`${index + 1}`}
                value={word}
                onChange={(e) => {
                    const updatedWords = [...mockSeed];
                    updatedWords[index] = e.target.value;
                    setMockSeed(updatedWords);
                  }}
                />
                </mui.Grid>
            )
            )
             }
        </mui.Grid>
        <CTAButton text={t("recover.recover")} onClick={()=>handleOrdering()} width='25%'/>
            </>
           )}

           {/* --Account Details-- */}
           {isSecureAccountVisible && (
                <mui.Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '90%',
                        backgroundColor: mui.alpha('#3a3a3a',0.6),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'bottom 0.5s ease-in-out',
                        borderRadius: '40px 40px 0 0',
                    }}
                >
                    <mui.Typography sx={{color:'#fff',mt:'10%',fontSize:'2rem'}}>Secure your Account</mui.Typography >
                    <LanguageSelector language={language} setLanguage={setLanguage}/>
                    <WhiteHueTextField
                  id="password"
                  label="Password"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setPassword(event.target.value); }}
                  value={password}
                  type= {passwordHidden?"password":""}
                  inputProps={{ style: { color: "#fff" } }}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  sx={{width:md?'55%':'65%',marginTop: md?'6%':'3%'}}   
                  InputProps={{
                    endAdornment: (
                      <mui.InputAdornment position="end">
                        {passwordHidden ? <VisibilityOffIcon style={{color:'#FFF',cursor:'pointer'}} onClick={() => setPasswordHidden(false)} /> : <VisibilityIcon style={{color:'#FFF'}} onClick={() => setPasswordHidden(true)} />}
                      </mui.InputAdornment>
                    )
                  }}   
                />


                <WhiteHueTextField
                  id="confirmPassword"
                  label="Confirm Password"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(event.target.value); }}
                  value={confirmPassword}
                  color="primary"
                  type= {confirmPasswordHidden?"password":""}
                  inputProps={{ style: { color: "#fff" } }}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  sx={{width:md?'55%':'65%' ,marginTop: md?'2%':'3%'}}      
                  InputProps={{
                    endAdornment: (
                      <mui.InputAdornment position="end">
                        {confirmPasswordHidden ? <VisibilityOffIcon style={{color:'#FFF',cursor:'pointer'}} onClick={() => setConfirmPasswordHidden(false)} /> : <VisibilityIcon style={{color:'#FFF'}} onClick={() => setConfirmPasswordHidden(true)} />}
                      </mui.InputAdornment>
                    )
                  }}
                />
                    {/* Additional components or buttons can be added here */}
                    <SecureButton onClick={() => {
                         recover(seed,password,biometric,language,navigate,setSuccess,setError,setMessage);
                        }}
                  sx={{marginTop:'5%'}}
                  endIcon={<ArrowForward style={{color:'#FFF'}} />}
                  >
                  <mui.Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    Secure
                  </mui.Typography>
                </SecureButton>
                   
                    { biometricAvail &&
                        <mui.Box sx={{
                            display:"flex",
                            flexDirection:"row", 
                            alignItems:"center",
                            justifyContent:"space-between",
                            alignSelf:"center",
                            width:"90%",
                            marginTop:"2%"
                            }}>
                        <mui.Typography sx={{color:"#fff"}}>
                        Unlock with Face ID?   
                    </mui.Typography>   
                
                    <mui.Switch aria-label="biometry-switch" onChange={() => setBiometric(!biometric)} sx={{color:'#00FFAA',bgcolor:'#00FFAA'}} />
                        </mui.Box>
                    }
                 {isLoading && (
                    <mui.CircularProgress sx={{ marginTop: '20%', color:'#00ffaa',top:0 }} />
                )}
                </mui.Box>
            )}
        </Layout>
    )
}

export default Recovery;