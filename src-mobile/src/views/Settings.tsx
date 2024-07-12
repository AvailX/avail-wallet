import { Box, IconButton, Typography } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import * as mui from "@mui/material";
import { listen } from "@tauri-apps/api/event";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  ExpandLess,
  ExpandMore,
  Settings as SettingIcon,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Fade from "@mui/material/Fade";

// //temporary
import { useTheme } from "@mui/material/styles";

import generalIcon from "../assets/settings/general-icon.svg";
import keysIcon from "../assets/settings/keys-icon.svg";
import secretIcon from "../assets/settings/secret-icon.svg";
import securityIcon from "../assets/settings/security-icon.svg";

import notificationsIcon from "../assets/settings/notifications-icon.svg";
import airdropIcon from "../assets/settings/airdrop-alert.svg";

import backupIcon from "../assets/settings/backup-icon.svg";
import fullIcon from "../assets/settings/full-icon.svg";
import messageIcon from "../assets/settings/message-icon.svg";
import removeIcon from "../assets/settings/remove-icon.svg";

import SettingsSwitch from "../components/AvailSwitch";

//Settings
// import GeneralSettings from "../components/settings/GeneralSettings"
// global state
import { useScan } from "../../../src/context/ScanContext";
// Services
import {
  getUsername,
  updateUsername,
  get_address,
  getLastSync,
  getLanguage,
  getNetwork,
  updateBackupFlag,
  getBackupFlag,
} from "../../../src/services/storage/persistent";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

import { sign, verify } from "../../../src/services/util/sign";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { scan_blocks } from "../../../src/services/scans/blocks";

import GeneralSettings from "../components/settings/GeneralSettings";
import KeysSettings from "../components/settings/KeysSettings";
import SecretPhrase from "../components/settings/SecretPhrase";
import SecurityPrivacy from "../components/settings/SecurityPrivacy";
import SignaMessage from "components/settings/SignaMessage";

// interface SettingsSwitchProps {
//   disabled: boolean;
//   checked: boolean;
//   onClick: (e: any) => void;
// }

// const SettingsSwitch: React.FC<SettingsSwitchProps> = ({ disabled, checked, onClick }) => {
//   return (
//     <Switch
//       disabled={disabled}
//       checked={checked}
//       onClick={onClick}
//     />
//   );
// };

// export default SettingsSwitch;
function Settings() {
  const SETTINGS_DETAIL = [
    {
      title: "Account",
      children: [
        { title: "General", icon: generalIcon },
        { title: "Keys", icon: keysIcon },
        { title: "Secret Phrase", icon: secretIcon },
        { title: "Security and Privacy", icon: securityIcon },
      ],
    },
    {
      title: "Alerts",
      children: [
        { title: "Notifications", icon: notificationsIcon, showSwitch: true },
        {
          title: "Airdrop Alert",
          icon: airdropIcon,
          showSwitch: true,
          disabled: true,
        },
      ],
    },
    {
      title: "Other",
      children: [
        {
          title: "Backup",
          icon: backupIcon,
          showSwitch: true,
          onSwitchChange: (checked: boolean) => handleBackupToggle(checked),
        },
        {
          title: "Full ReSync",
          icon: fullIcon,
          showSwitch: true,
          disabled: true,
        },
        { title: "Sign a message", icon: messageIcon },
        { title: "Remove Account", icon: removeIcon },
      ],
    },
  ];
  //temporary sidebar states
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const theme = useTheme();

  // Alert states
  const [success, setSuccess] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [info, setInfo] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  // General States
  const [username, setUsername] = React.useState<string>("");
  const [language, setLanguage] = React.useState<string>("");
  const [network, setNetwork] = React.useState<string>("");
  const [address, setAddress] = React.useState<string>("");

  // Key states
  const [pk, setPk] = React.useState<string>("");
  const [vk, setVk] = React.useState<string>("");

  // Seed Phrase states
  const [seedPhrase, setSeedPhrase] = React.useState<string>("");
  const [revealAll, setRevealAll] = React.useState(false);

  // Advanced settings states
  const [lastSync, setLastSync] = React.useState<number>(0);
  const [backup, setBackup] = React.useState<boolean>(false);

  // Dialog states
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [vkOpen, setVkOpen] = React.useState(false);
  const [pkOpen, setPkOpen] = React.useState(false);
  const [spOpen, setSpOpen] = React.useState(false);
  const [reAuthDialog, setReAuthDialog] = React.useState(false);

  // Sign states
  const [signature, setSignature] = React.useState<string>("");
  const [signMessage, setSignMessage] = React.useState<string>("");

  // Verification states
  const [addressToVerify, setAddressToVerify] = React.useState<string>("");
  const [signatureToVerify, setSignatureToVerify] = React.useState<string>("");
  const [verificationMessage, setVerificationMessage] =
    React.useState<string>("");
  const [verifyResult, setVerifyResult] = React.useState<boolean>();

  const { t } = useTranslation();
  const shouldRunEffect = React.useRef(true);

  const ProfileDisplay = ({
    setUsername,
    address,
  }: {
    setUsername: string;
    address: string;
  }) => {
    return (
      <Box display="flex" alignItems="center" my={3}>
        <Box
          borderRadius="50%"
          bgcolor="#979797"
          width="45px"
          height="45px"
          mr={2}
        ></Box>
        <Box textAlign="left">
          <Typography fontWeight={700} fontSize="17px">
            {setUsername}
          </Typography>
          {/* {setAddress} */}
          <Typography color="#A7A7A7">
            {address.length > 15 ? `${address.substring(0, 15)}...` : address}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Scanning state
  {
    /* --Block Scan State */
  }
  const { scanInProgress, startScan, endScan } = useScan();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (shouldRunEffect.current) {
      /* --Get Username-- */
      getUsername()
        .then((res) => {
          setUsername(res);
        })
        .catch((error_) => {
          setMessage("Error getting username.");
          setError(true);
        });

      /* --Get Language-- */
      getLanguage()
        .then((res) => {
          setLanguage(res.toString());
        })
        .catch((error_) => {
          setMessage("Error getting language.");
          setError(true);
        });

      /* --Get Network-- */
      getNetwork()
        .then((res) => {
          // Capitalize first letter
          res = res.charAt(0).toUpperCase() + res.slice(1);
          setNetwork(res);
        })
        .catch((error_) => {
          setMessage("Error getting network.");
          setError(true);
        });

      /* --Get Address-- */
      get_address()
        .then((res) => {
          setAddress(res);
        })
        .catch((error_) => {
          setMessage("Error getting address.");
          setError(true);
        });

      /* --Get Last Sync-- */
      getLastSync()
        .then((res) => {
          setLastSync(res);
        })
        .catch((error_) => {
          setMessage("Error getting last synced block height.");
          setError(true);
        });

      /* --Get Backup-- */
      getBackupFlag()
        .then((res) => {
          setBackup(res);
        })
        .catch((error_) => {
          setMessage("Error getting backup flag.");
          setError(true);
        });

      shouldRunEffect.current = false;
    }
  }, []);

  const handleSign = () => {
    sign(message)
      .then((res) => {
        if (res.signature) {
          setSignature(res.signature);
          setMessage("Message signed successfully.");
          setSuccess(true);
        }
      })
      .catch((error_) => {
        console.log(error_);
        setMessage("Error signing message. Please try again.");
        setError(true);
      });
  };

  const handleVerify = () => {
    verify(verificationMessage, signatureToVerify, addressToVerify)
      .then((res) => {
        console.log("Verification Result " + res);
        if (res) {
          setMessage("Signature verified successfully.");
          setSuccess(true);
          setVerifyResult(true);
        } else {
          setMessage("Signature verification failed.");
          setError(true);
          setVerifyResult(false);
        }
      })
      .catch((error_) => {
        console.log(error_);
        setMessage("Error verifying signature. Please try again.");
        setError(true);
      });
  };

  const handleFullResync = () => {
    startScan();
    scan_blocks(0, setError, setMessage)
      .then((res) => {
        endScan();
      })
      .catch((error_) => {
        endScan();
        setMessage("Error scanning blocks.");
        setError(true);
      });
  };

  const handleCopyToClipboard = (parameter: string, label: string) => {
    navigator.clipboard.writeText(parameter);
    setMessage(label + " copied successfully!");
    setSuccess(true);
  };

  // /* --Event Listners */
  // React.useEffect(() => {
  //   const unlisten = listen("reauthenticate", async (event) => {
  //     const remove_listener = await unlisten;
  //     remove_listener();

  //     setReAuthDialog(true);
  //   });
  // }, []);

  const handleOpen = () => {
    // setSelectedOption();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOption(null);
  };

  const handleBackupToggle = (event) => {
    const checked = event.target.checked;
    setBackup(checked);
    localStorage.setItem("backup", JSON.stringify(checked));
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography color="#00FFAA" fontSize="25px" fontWeight={700}>
          Settings
        </Typography>
      </Box>
      <ProfileDisplay setUsername={username} address={address} />
      <Box textAlign="left">
        {SETTINGS_DETAIL.map(({ title, children }) => (
          <Box mb={2}>
            {title && (
              <Typography fontSize="25px" fontWeight={700} color="#fff">
                {title}
              </Typography>
            )}
            <Box bgcolor="#2A2A2A" borderRadius="9px" mt={2}>
              {children.map(
                ({
                  title,
                  icon,
                  showSwitch,
                  disabled,
                }: {
                  title: string;
                  icon?: any;
                  showSwitch?: boolean;
                  disabled?: any;
                  // checked?: boolean;
                }) => (
                  <Box width="100%" mx="auto" bgcolor="#2A2A2A">
                    {showSwitch ? (
                      <Box
                        borderBottom="1px solid #353535"
                        p={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        onClick={() => handleOpen()}
                      >
                        <Box display="flex" alignItems="center" paddingX={1}>
                          <img src={icon} />
                          <Typography ml={2} color="#fff" fontSize="17px">
                            {title}
                          </Typography>
                        </Box>
                        <SettingsSwitch
                          disabled={disabled}
                          onSwitchChange={handleBackupToggle}
                          checked={backup}
                        />
                      </Box>
                    ) : (
                      <Accordion
                        sx={{
                          bgcolor: "#2A2A2A",
                          borderBottom: "1px solid #353535",
                          width: "100%",
                          margin: 0,
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore sx={{ color: "white" }} />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Box display="flex" alignItems="center">
                            <img src={icon} alt={title} />
                            <Typography ml={2} color="#fff" fontSize="17px">
                              {title}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {title === "General" && (
                            <GeneralSettings
                              username={username}
                              setUsername={setUsername}
                              language={language}
                              setLanguage={setLanguage}
                              network={network}
                              address={address}
                            />
                          )}
                          {title === "Keys" && <KeysSettings />}{" "}
                          {title === "Secret Phrase" && <SecretPhrase />}{" "}
                          {title === "Security and Privacy" && (
                            <SecurityPrivacy />
                          )}
                          {title === "Sign a message" && <SignaMessage />}
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Box>
                )
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </DashboardLayout>
  );
}

export default Settings;
