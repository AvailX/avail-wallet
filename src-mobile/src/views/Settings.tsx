import { Box, IconButton, Typography } from "@mui/material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardLayout from "../layouts/DashboardLayout";

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

const ProfileDisplay = () => {
  return (
    <Box display='flex' alignItems='center' my={3}>
      <Box
        borderRadius='50%'
        bgcolor='#979797'
        width='45px'
        height='45px'
        mr={2}
      ></Box>
      <Box textAlign='left'>
        <Typography fontWeight={700} fontSize='17px'>
          Normal Lowell
        </Typography>
        <Typography color='#A7A7A7'>aleo7843ab4...3894</Typography>
      </Box>
    </Box>
  );
};

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
        { title: "Airdrop Alert", icon: airdropIcon, showSwitch: true },
      ],
    },
    {
      title: "Other",
      children: [
        { title: "Backup", icon: backupIcon, showSwitch: true },
        { title: "Full ReSync", icon: fullIcon, showSwitch: true },
        { title: "Sign a message", icon: messageIcon },
        { title: "Remove Account", icon: removeIcon },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography color='#00FFAA' fontSize='25px' fontWeight={700}>
          Settings
        </Typography>
      </Box>
      <ProfileDisplay />
      <Box textAlign='left'>
        {SETTINGS_DETAIL.map(({ title, children }) => (
          <Box mb={2}>
            {title && (
              <Typography fontSize='25px' fontWeight={700} color='#fff'>
                {title}
              </Typography>
            )}
            <Box bgcolor='#2A2A2A' borderRadius='9px' mt={2}>
              {children.map(
                ({
                  title,
                  icon,
                  showSwitch,
                }: {
                  title: string;
                  icon?: any;
                  showSwitch?: boolean;
                }) => (
                  <Box width='90%' mx='auto'>
                    <Box
                      borderBottom='1px solid #353535'
                      p={1}
                      display='flex'
                      alignItems='center'
                      justifyContent='space-between'
                    >
                      <Box display='flex' alignItems='center'>
                        <img src={icon} />
                        <Typography ml={2} color='#fff' fontSize='17px'>
                          {title}
                        </Typography>
                      </Box>
                      {showSwitch ? (
                        <SettingsSwitch />
                      ) : (
                        <IconButton>
                          <ChevronRightIcon sx={{ color: "#B0B0B0" }} />
                        </IconButton>
                      )}
                    </Box>
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
