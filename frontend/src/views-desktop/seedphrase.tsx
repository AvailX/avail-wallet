import * as React from 'react';
import * as mui from '@mui/material';

//components
import Layout from './reusable/layout';
import CTAButton from '../components/buttons/cta';

//typography
import { TitleText,SubtitleText, BodyText } from '../components/typography/typography';

//images
import a_logo from "../assets/logo/a-icon.svg";

//icons 
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

//alerts
import { SuccessAlert } from '../components/snackbars/alerts';

//Hooks
import { useNavigate,useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// pass as state parameter from register
// Mock data for secret words


// RevealWords component
const SeedPhrase = () => {
  const [revealedWord, setRevealedWord] = React.useState<string | null>(null);
  const [revealAll, setRevealAll] = React.useState(false);
  const [success,setSuccess] = React.useState<boolean>(false);
  const [warning,setWarning] = React.useState<boolean>(true);

  const {t} = useTranslation();

  const secretWords: string[] = useLocation().state.seed;

  const handleRevealToggle = () => {
    setRevealAll((prev) => !prev);
    };
    
    const handleCopyToClipboard = () => {
    const phrase = secretWords.join(' '); // Joins all secret words into a single string
    navigator.clipboard.writeText(phrase);
    setSuccess(true);
    };

    const navigate = useNavigate();


    const WarningAlert: React.FC=()=>{
      return(
          <mui.Snackbar open={warning} anchorOrigin={{ vertical:"top", horizontal:"right" }}>
              <div>
          <mui.Alert severity="warning" action={ <mui.IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={()=> setWarning(false)}
          >
            <CloseIcon fontSize="small" />
          </mui.IconButton>
      }>
         
            <mui.AlertTitle>{t("seedphrase.warning.label")}</mui.AlertTitle>
            {t("seedphrase.warning.message")}
          </mui.Alert>
          </div>
        </mui.Snackbar>
      )
  }

  return (
    <Layout>    
        <WarningAlert/>
        <SuccessAlert message={t("seedphrase.copied")} successAlert={success} setSuccessAlert={setSuccess}/>
        <img src={a_logo} alt="aleo logo" style={{width:"60px", height:"60px", marginTop:"20px", marginLeft:"20px"}}/>
        <mui.Box sx={{width:'85%',alignSelf:'center'}}>
        <TitleText sx={{color:'#FFF'}}>{t("seedphrase.title")}</TitleText>
        <SubtitleText sx={{color:'#a3a3a3'}}>{t("seedphrase.subtitle")}</SubtitleText>
        </mui.Box>
        <mui.Grid container spacing={1} sx={{ marginTop:"25px",alignSelf:'center',bgcolor:'#1E1D1D',borderRadius:'10px',width:'85%',padding:'5%',justifyContent:'center',mb:'1%',alignItems:'center',position:'relative'}}>
        
        {/* Overlay with blur effect */}
        {!revealAll && (
           <mui.Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
            backdropFilter: 'blur(4px)', // Blur effect
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px', // Match the parent's border radius
          }}>
          
          </mui.Box>
      )}

      {/* Secret words grid items */}
            {secretWords.map((word, index) => (
                <mui.Grid 
                key={index}
                sx={{color:"#fff",m:'2%',bgcolor:'#3E3E3E',borderRadius:'10px',padding:'1%',textAlign:'center'}}
                item
                xs={3} // Adjust the grid size as needed
                >  
                  <mui.Typography variant="body1" >{word}</mui.Typography>
                </mui.Grid>
            ))}
        </mui.Grid>
        <mui.Box sx={{ display: 'flex', justifyContent: 'flex-end',alignSelf:'center',right:0,width:'85%' }}>
      <mui.IconButton onClick={handleCopyToClipboard} size="large" sx={{ color: '#00FFAA','&:hover':{bgcolor: mui.alpha('#3a3a3a',0.8)} }}>
        <ContentCopyIcon fontSize="inherit" />
      </mui.IconButton>
      <mui.IconButton onClick={handleRevealToggle} size="large" sx={{ color: revealAll ? '#00FFAA' : 'white' }}>
        {revealAll ? <VisibilityIcon fontSize="inherit" /> : <VisibilityOffIcon fontSize="inherit" />}
      </mui.IconButton>
     </mui.Box>
        <CTAButton text={t("seedphrase.continue")} onClick={()=>navigate('/verify',{state:{seed: secretWords}})} width='25%'/>
    </Layout>
  );
};

export default SeedPhrase;
