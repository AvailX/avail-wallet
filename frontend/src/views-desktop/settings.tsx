import * as React from 'react';
import * as mui from '@mui/material';

//components 
import Layout from './reusable/layout';
import MiniDrawer from '../components/sidebar';
import CTAButton from '../components/buttons/cta';
import STButton from '../components/buttons/settings-button';
import GeneralSettings from '../components/settings/general';

//dialogs
import DeleteDialog from '../components/dialogs/delete';
import ViewKeyDialog from '../components/dialogs/keys/get_viewing_key';
import PrivateKeyDialog from '../components/dialogs/keys/get_private_key';
import SeedPhraseDialog from '../components/dialogs/keys/get_seed_phrase';

//icons
import { ExpandLess,ExpandMore, Settings as SettingIcon, VpnKey, Lock, Info,Security,Polyline,RemoveCircleOutline } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

//typography
import { Title2Text,SubMainTitleText,SubtitleText, BodyText, BodyText500, SmallText400 } from '../components/typography/typography';

// global state
import { useScan } from '../context/ScanContext';

//services
import { getUsername,updateUsername,get_address,getLastSync,getLanguage,getNetwork,updateBackupFlag,getBackupFlag} from '../services/storage/persistent';

//alerts
import { SuccessAlert,ErrorAlert,WarningAlert,InfoAlert } from '../components/snackbars/alerts';
import { delete_util } from '../services/authentication/auth';
import { scan_blocks } from '../services/scans/blocks';

import { useTranslation } from 'react-i18next';


const MenuSection: React.FC<{
    title: string;
    IconComponent: React.ReactNode;
    children?: React.ReactNode;
  }> = ({ title, IconComponent, children }) => {
    const [open, setOpen] = React.useState(false);
  
    const handleClick = () => {
      setOpen(!open);
    };
  
    return (
      <>
        <mui.ListItemButton onClick={handleClick} sx={{p:2,'&:hover':{bgcolor:'#3a3a3a'}}}>
          <mui.ListItemIcon>
            {IconComponent}
          </mui.ListItemIcon>
          <mui.ListItemText primary={title}  sx={{color:'#FFF'}}/>
          {open ? <ExpandLess sx={{color:'#fff'}}/> : <ExpandMore sx={{color:'#fff'}}/>}
        </mui.ListItemButton>
        <mui.Collapse in={open} timeout="auto" unmountOnExit>
          <mui.List component="div" disablePadding>
            {children}
          </mui.List>
        </mui.Collapse>
      </>
    );
  };
  

function Settings(){
  // alert states
  const [success,setSuccess] = React.useState<boolean>(false);
  const [warning,setWarning] = React.useState<boolean>(true);
  const [error,setError] = React.useState<boolean>(false);
  const [info,setInfo] = React.useState<boolean>(false);
  const [message,setMessage] = React.useState<string>('');

  // General States
  const [username, setUsername] = React.useState<string>('');
  const [language, setLanguage] = React.useState<string>('');
  const [network, setNetwork] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('');

  // Key states
  const [pk, setPk] = React.useState<string>('');
  const [vk, setVk] = React.useState<string>('');

  // Seed Phrase states
  const [seedPhrase, setSeedPhrase] = React.useState<string>('');
  const [revealAll, setRevealAll] = React.useState(false);
  
  //advanced settings states
  const [lastSync, setLastSync] = React.useState<number>(0);
  const [backup, setBackup] = React.useState<boolean>(false);

  //dialog states
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [vkOpen, setVkOpen] = React.useState(false);
  const [pkOpen, setPkOpen] = React.useState(false);
  const [spOpen, setSpOpen] = React.useState(false);

  const {t} = useTranslation();

  //scanning state
  {/* --Block Scan State */ }
  const { scanInProgress, startScan, endScan } = useScan();


  React.useEffect(()=>{
    /* --Get Username-- */
    getUsername().then((res)=>{
      setUsername(res);
    }).catch((err)=>{
      setMessage("Error getting username.");
      setError(true);
    })

    /* --Get Language-- */
    getLanguage().then((res)=>{
      setLanguage(res.toString());
    }).catch((err)=>{
      setMessage("Error getting language.");
      setError(true);
    });

    /* --Get Network-- */
    getNetwork().then((res)=>{
      //capitalize first letter
      res = res.charAt(0).toUpperCase() + res.slice(1);
      setNetwork(res);
    }).catch((err)=>{
      setMessage("Error getting network.");
      setError(true);
    });

    /* --Get Address-- */
    get_address().then((res)=>{
      setAddress(res);
    }).catch((err)=>{
      setMessage("Error getting address.");
      setError(true);
    });

    /* --Get Last Sync-- */
    getLastSync().then((res)=>{
      setLastSync(res);
    }).catch((err)=>{
      setMessage("Error getting last synced block height.");
      setError(true);
    });

    /* --Get Backup-- */
    getBackupFlag().then((res)=>{
      setBackup(res);
    }).catch((err)=>{
      setMessage("Error getting backup flag.");
      setError(true);
    });
  },[])

    const handleFullResync = () => {
      startScan();
      scan_blocks(0,setError,setMessage).then((res)=>{
        endScan();
      }).catch((err)=>{
        endScan();
        setMessage("Error scanning blocks.");
        setError(true);
      })
    }

    const handleCopyToClipboard = (param: string,label:string) => {
        navigator.clipboard.writeText(param);
        setMessage(label+' copied successfully!');
        setSuccess(true);
    };

    const HiddenItem:React.FC<{param:string,label:string}> = ({param,label})=>{
        return(
        <mui.Box>
          <mui.Box sx={{display:'flex',flexDirection:'row'}}>
          <STButton text={param == ''?'Get and Decrypt':revealAll?'Lock':'Unlock'} onClick={param == ''?(()=>label === "Private Key"?setPkOpen(true):label ==="Viewing Key"?setVkOpen(true):setSpOpen(true)):(()=> setRevealAll(!revealAll))}/>
            {param !== '' && (
                <mui.IconButton onClick={()=>handleCopyToClipboard(param,label)} size="large" sx={{ color: '#00FFAA','&:hover':{bgcolor: mui.alpha('#3a3a3a',0.8)} }}>
                    <ContentCopyIcon fontSize="inherit" />
                </mui.IconButton>
            )}
            </mui.Box>
          <mui.Box sx={{mt:'2%',borderRadius:'10px',bgcolor:'#1E1D1D',justifyContent:'space-between',mb:'1%',alignItems:'center',position:'relative',padding:2,display:'flex',flexDirection:'row'}}>
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
          <SmallText400 sx={{color:'#FFF'}}>{param}</SmallText400>
        
         </mui.Box>
         </mui.Box>
        )
    }
    

 return(
    <Layout>
        <SuccessAlert successAlert={success} setSuccessAlert={setSuccess} message={message}/>
        <ErrorAlert errorAlert={error} setErrorAlert={setError} message={message}/>
        <DeleteDialog isOpen={deleteOpen} onRequestClose={()=> setDeleteOpen(false)}/>
        <ViewKeyDialog isOpen={vkOpen} onRequestClose={()=>setVkOpen(false)} setViewKey={setVk}/>
        <PrivateKeyDialog isOpen={pkOpen} onRequestClose={()=>setPkOpen(false)} setPrivateKey={setPk}/>
        <SeedPhraseDialog isOpen={spOpen} onRequestClose={()=>setSpOpen(false)} setSeedPhrase={setSeedPhrase}/>
     <MiniDrawer/>
     <mui.Box sx={{display:'flex',flexDirection:'column',ml:'9%',mt:'2%'}}>
     <Title2Text sx={{color:'#FFF'}}>{t("settings.title")}</Title2Text>
     <SubtitleText sx={{color:'#a3a3a3'}}>{t("settings.subtitle")}</SubtitleText>
     <mui.Box sx={{display:'flex',flexDirection:'column',mt:'7%',width:'90%'}}>
         
         {/* --General-- */}
        <MenuSection title={t("settings.General")} IconComponent={<SettingIcon sx={{color:'#00FFAA'}}/>}>
          <GeneralSettings username={username} setUsername={setUsername} language={language} setLanguage={setLanguage} network={network} address={address}/>
        </MenuSection>
       
        {/* --Keys-- */}
        <MenuSection title={t("settings.keys.title")} IconComponent={<VpnKey sx={{color:'#00FFAA'}}/>}>
        <BodyText sx={{color:'#fff'}}>{t("settings.keys.viewing-key")}</BodyText>
        <HiddenItem param={vk} label='Viewing Key'/>
        <BodyText sx={{color:'#fff',mt:'5%'}}>{t("settings.keys.private-key")}</BodyText>
            <HiddenItem param={pk} label='Private Key'/>
        </MenuSection>


        {/* --Secret Phrase-- */}
        <MenuSection title={t("settings.keys.secret-phrase")} IconComponent={<Lock sx={{color:'#00FFAA'}}/>}>
            <HiddenItem param={seedPhrase} label='Secret Phrase'/>
        </MenuSection>

        {/* --Security and Privacy-- */}
        <MenuSection title={t("settings.security.title")} IconComponent={<Security sx={{color:'#00FFAA'}}/>}>
          {/* Place security and privacy options here */}

          {/* Link terms and conditions and privacy policy here*/}
           <mui.Box sx={{display:'flex',justifyContent:'center'}}>
          <SmallText400 sx={{color:'#fff',width:'80%'}}> {t("settings.security.description")}</SmallText400>
          </mui.Box>
        </MenuSection>

        {/* --About Avail-- */}
        <MenuSection title={t("settings.about.title")} IconComponent={<Info sx={{color:'#00FFAA'}}/>}>
          {/* Place about information here */}
          <mui.Box sx={{display:'flex',justifyContent:'center'}}>
          <SmallText400 sx={{color:'#fff',width:'80%'}}> {t("settings.about.description")}</SmallText400>
          </mui.Box>
        </MenuSection>

        {/* --Advanced Settings-- */}
        <MenuSection title={t("settings.advanced.title")} IconComponent={<Polyline sx={{color:'#00FFAA'}}/>} >
          {/* Place advanced settings options here */}
          <mui.Box sx={{display:'flex',flexDirection:'row'}}>
          <BodyText sx={{color:'#fff'}}>{t("settings.advanced.block-height")}</BodyText>
          <BodyText500 sx={{ml:'1%',color:'#00FFAA'}}>{lastSync}</BodyText500>
          </mui.Box>
          <mui.Box sx={{display:'flex',flexDirection:'row',mt:'2%',mb:'2%'}}>
          <STButton text={t("settings.advanced.full-resync")} onClick={()=>{handleFullResync()}}/>
           {scanInProgress ?(
              <mui.Box sx={{color:'#00FFAA',ml:'3%',display:'flex',flexDirection:'column'}}>
             <mui.CircularProgress sx={{color:'#00FFAA',ml:'3%',alignSelf:'center'}}/>
             <SmallText400 sx={{mt:'4%'}}>{t("settings.advanced.scan-progress")}</SmallText400>
             </mui.Box>
           ):(
            <mui.Box/>
           )}
           </mui.Box>
           <mui.Box sx={{mt:'3%'}}>
            <STButton text={backup?t("settings.advanced.disable-backup"):t("settings.advanced.enable-backup")} onClick={()=>{backup? updateBackupFlag(false):updateBackupFlag(true)}}/>
           </mui.Box>
        </MenuSection>
        {/* --Remove Account-- */}
        <MenuSection title={t("settings.delete.title")} IconComponent={<RemoveCircleOutline sx={{color:'#D21C1C'}}/>}>
            <STButton text={t("settings.delete.STButton")} onClick={()=>setDeleteOpen(true)}/>
        </MenuSection>
        </mui.Box>
     </mui.Box>
    </Layout>
 )   
}

export default Settings;