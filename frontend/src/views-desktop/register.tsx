import * as React from "react";
import * as mui from "@mui/material";

//services
import { register, checkBiometrics, register_seed_phrase } from "../services/authentication/register";
import { delete_key } from "../services/keychain/keychain";

//components
import Layout from "./reusable/layout";
import WhiteHueTextField from "../components/textfields/white-hue";
import SignUpButton from "../components/buttons/sign-up-button";
import LanguageSelector from "../components/select/language";

//typography
import { TitleText,SmallText, BodyText } from "../components/typography/typography";

//alerts
import { ErrorAlert, WarningAlert, InfoAlert, SuccessAlert } from "../components/snackbars/alerts";

//images
import full_logo from "../assets/logo/desktop-full-logo.svg";
import loginimage from "../assets/images/backgrounds/sign-up-bg.jpeg";

//icons
import ArrowForward from "@mui/icons-material/ArrowForward";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useNavigate } from "react-router-dom";

//types
import { AvailError } from "../types/errors";
import { Languages } from "../types/languages";

import { useTranslation } from "react-i18next";


function Register() {
  const [username, setUsername] = React.useState<string | undefined>();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [language, setLanguage] = React.useState(Languages.English);

  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = React.useState(true);

  {/* --Biometric States--*/ }
  const [biometric, setBiometric] = React.useState(false);
  const [biometricAvail, setBiometricAvail] = React.useState(false);


  {/* --Alert States--*/ }
  const [error, setError] = React.useState(false);
  const [warning, setWarning] = React.useState(false);
  const [info, setInfo] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const navigate = useNavigate();
  const { t } = useTranslation();

 // Check if biometrics work with mac
  const shouldRunEffect = React.useRef(true);
  
  /* For Mobile -- Check Biometry */
  {/* 
  React.useEffect(() => {
    if (!shouldRunEffect.current) return;
    checkBiometrics().then((response) => {
      setBiometricAvail(response);
    }).catch((error) => {
      console.log(error);
    })

    return () => {
      shouldRunEffect.current = false;
    }
  }, []);
*/}

  function handleCreateWallet() {

    if (password != confirmPassword) {
      setMessage(t("signup.messages.errors.password1"));
      setError(true);
      return;
    }

    // if username not unique

    if (password.length < 12) {
      setMessage(t("signup.messages.errors.password2"));
      setError(true);
      return;
    }

    register_seed_phrase(setError, setMessage, username, password, biometric,language).then((response) => {
      if (response) {
        //split seed phrase into array by spaces
        let seed_array = response.split(" ");

        setMessage(t("signup.messages.success"));
        setSuccess(true); 
        console.log(response);

        setTimeout(() => {
        navigate("/seed",{state:{seed:seed_array}});
        }, 800);
      }
    }).catch((error: AvailError) => {
      setMessage(error.external_msg);
      setError(true);
    });
  }

  const md = mui.useMediaQuery('(min-width:1000px)');
  const lg = mui.useMediaQuery('(min-width:1200px)');

  return (
      <Layout>
         {/* --Alerts-- */}
      <ErrorAlert errorAlert={error} message={message} setErrorAlert={setError} />
      <WarningAlert warningAlert={warning} message={message} setWarningAlert={setWarning} />
      <InfoAlert infoAlert={info} message={message} setInfoAlert={setInfo} />
      <SuccessAlert successAlert={success} message={message} setSuccessAlert={setSuccess} />
       
        
            <mui.Box  sx={{display:'flex',flexDirection:'row',width:'100%'}}>
             
              <mui.Box sx={{height:'100vh',width:'50%',backgroundImage:`linear-gradient(to right, transparent, #111111),url(${loginimage})`,backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}/>
              
              <mui.Grid xs={6} sx={{marginTop:lg?'7%':md?'5.5%':'3%',ml:lg?'7%':md?'5%':'7%'}}>
              <mui.Box sx={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <img src={full_logo} style={{ width: "40%",height:'auto',marginLeft:'-20px'}} />
              
              <LanguageSelector language={language} setLanguage={setLanguage} sx={{alignSelf:'flex-end',mr:'5%'}}/>
              
              </mui.Box>
              
              
                <mui.Box sx={{ display: "flex",flexDirection:'row', width: "90%",mt:'-20px'}}>
                  <TitleText sx={{color: "#FFF"}} >{t('signup.tagline.part1')}</TitleText>
                  <TitleText sx={{ ml:'2.5%',color: "#00FFAA"}}> {t('signup.tagline.part2')} </TitleText>
                </mui.Box>

             
          
                <WhiteHueTextField
                  id="username"
                  label=  {t('signup.username')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setUsername(event.target.value); }}
                  value={username}
                  inputProps={{ style: { color: "#fff" } }}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  sx={{width:md?'75%':'85%',marginTop: md?'6%':'3%'}}                
                  />


                <WhiteHueTextField
                  id="password"
                  label={t('signup.password')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setPassword(event.target.value); }}
                  value={password}
                  type= {passwordHidden?"password":""}
                  inputProps={{ style: { color: "#fff" } }}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  sx={{width:md?'75%':'85%',marginTop: md?'6%':'3%'}}   
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
                  label={t('signup.confirmPassword')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(event.target.value); }}
                  value={confirmPassword}
                  color="primary"
                  type= {confirmPasswordHidden?"password":""}
                  inputProps={{ style: { color: "#fff" } }}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  sx={{width:md?'75%':'85%' ,marginTop: md?'6%':'3%'}}      
                  InputProps={{
                    endAdornment: (
                      <mui.InputAdornment position="end">
                        {confirmPasswordHidden ? <VisibilityOffIcon style={{color:'#FFF',cursor:'pointer'}} onClick={() => setConfirmPasswordHidden(false)} /> : <VisibilityIcon style={{color:'#FFF'}} onClick={() => setConfirmPasswordHidden(true)} />}
                      </mui.InputAdornment>
                    )
                  }}
                />

                <SignUpButton onClick={() => {
                    handleCreateWallet();
                    //register(username, password, biometric, navigate);
                    // navigate('/home-desktop')
                  }} 
                  sx={{marginTop:'5%'}}
                  endIcon={<ArrowForward style={{color:'#FFF'}} />}
                  >
                  <mui.Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {t('signup.CTAButton')}
                  </mui.Typography>
                </SignUpButton>

                <mui.Box sx={{ display: "flex",flexDirection:'row', marginTop: "3%" }}>
                  <mui.Typography sx={{ color: "#a3a3a3", fontSize: 12, fontWeight: '700' }}> {t('signup.terms.part1')}</mui.Typography>
                  <mui.Typography sx={{ color: "#a3a3a3",  fontSize: 12, fontWeight: '700',ml:'0.7%',"&:hover":{color:'#00FFAA',cursor:'pointer'} }}> {t('signup.terms.part2')}</mui.Typography>
                  <mui.Typography sx={{ color: "#a3a3a3",fontSize: 12, fontWeight: '700', ml:'0.7%' }}> {t('signup.terms.part3')}</mui.Typography>
                  <mui.Typography sx={{ color: "#a3a3a3",  fontSize: 12, fontWeight: '700',ml:'0.7%',"&:hover":{color:'#00FFAA',cursor:'pointer'} }}>{t('signup.terms.part4')}</mui.Typography>
                </mui.Box>

                <mui.Box sx={{ display: "flex",flexDirection:'row', marginTop: "5%", width: md?"75%":'85%',alignItems:'center',justifyContent:'space-between' }}>
                  <mui.Typography sx={{ color: "#a3a3a3", fontSize: 18, fontWeight: '700', wordWrap: 'break-word', alignContent: "end" }}>{t('signup.access')}</mui.Typography>
                  <mui.Button sx={{ display: "flex", width: "123px", height: "35px", borderRadius: 9, background: '#3E3E3E', color: "#FFFFFF",'&:hover':{background: '#00FFAA',color:'#000'} }} onClick={() => navigate("/recovery")}>
                    <BodyText sx={{ fontWeight: '700', wordWrap: 'break-word',textTransform:'none' }}>{t('signup.recover')}</BodyText>
                  </mui.Button>
                </mui.Box>
                
              </mui.Grid>
            </mui.Box>
         
    


      </Layout>
       
  )
}

export default Register;