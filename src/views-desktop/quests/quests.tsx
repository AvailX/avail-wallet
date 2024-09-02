// Components
import Layout from '../reusable/layout';
import SideMenu from '../../components/sidebar';
import QuestBox from '../../components/quests/quest';
import TaskDrawer from '../../components/quests/tasks_drawer';

// Types
import { type CampaignDetailPageProps } from '../../types/quests/quest_types';
import { type Quest } from '../../types/quests/quest_types';

// Images
import verified from '../../assets/icons/verified.svg';

// Typography
import { BodyText500 } from '../../components/typography/typography';

// Services
import { isQuestCompleted } from '../../services/quests/quests';

// Hooks
import { useLocation } from 'react-router-dom';

// Alerts
import { SuccessAlert, ErrorAlert } from '../../components/snackbars/alerts';
import { FC, useState } from 'react';
import { useMediaQuery, Box, Typography, Divider, Grid } from '@mui/material';

const Quests: FC = () => {
  const { campaign, quests } = useLocation().state as CampaignDetailPageProps;
  const [quest, setQuest] = useState<Quest>(quests[0]);
  const [openTasks, setOpenTasks] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');

  const mdsx = useMediaQuery('(min-width:850px)');
  const md = useMediaQuery('(min-width:950px)');
  const mdlg = useMediaQuery('(min-width:1150px)');
  const lgsx = useMediaQuery('(min-width:1550px)');
  const lg = useMediaQuery('(min-width:1750px)');
  const lgxl = useMediaQuery('(min-width:1950px)');

  return (
    <Layout>
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <SideMenu />
      <TaskDrawer
        open={openTasks}
        onClose={() => {
          setOpenTasks(false);
        }}
        quest={quest}
      />
      <Box
        sx={{
          ml: md ? '5%' : '7%',
          display: 'flex',
          flexDirection: 'column',
          width: md ? '95%' : '93%',
        }}
      >
        <Box
          sx={{
            background: `url(${campaign.bg_image})`,
            color: campaign.color,
            backgroundPosition: lgxl ? 'center' : 'bottom',
            height: lgxl ? '380px' : '320px',
            backgroundSize: 'cover',
          }}
        >
          <Box
            sx={{
              borderRadius: '100%',
              border: '1px solid #696969',
              p: 1.5,
              width: '200px',
              mt: lgxl
                ? '10%'
                : lg
                  ? '8%'
                  : lgsx
                    ? '10%'
                    : mdlg
                      ? '10%'
                      : md
                        ? '13%'
                        : mdsx
                          ? '14%'
                          : '17%',
              ml: '5%',
            }}
          >
            <Box
              component='img'
              src={campaign.profile_image}
              sx={{ borderRadius: 0, maxWidth: '100%' }}
            />
          </Box>
          <Box
            component='img'
            src={verified}
            sx={{
              borderRadius: 0,
              ml: lgxl
                ? '11%'
                : lg
                  ? '13%'
                  : lgsx
                    ? '15%'
                    : mdlg
                      ? '17%'
                      : md
                        ? '20%'
                        : '23%',
              mt: lg ? '-8%' : lgsx ? '-10%' : '-12%',
            }}
          />
        </Box>
        <Box sx={{ ml: '2%', mt: '5%' }}>
          <Typography variant='h3' color='#FFF'>
            {campaign.title}
          </Typography>
          <BodyText500 color='#A3A3A3'>
            {campaign.inner_description}
          </BodyText500>
        </Box>
        <Divider
          sx={{ width: '100%', height: '1px', bgcolor: '#00FFAA', mt: '3%' }}
          orientation='horizontal'
        />
        <Grid
          container
          spacing={2}
          sx={{
            marginTop: '20px',
            alignItems: 'center',
            mb: '5%',
            paddingLeft: '2%',
            bgcolor: '#111111',
            alignSelf: 'center',
            width: '100%',
            justifyContent: 'space-around',
          }}
        >
          {quests.map((quest) => (
            <QuestBox
              key={quest.id}
              quest={quest}
              openTasks={openTasks}
              setOpenTasks={setOpenTasks}
              setQuest={setQuest}
            />
          ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Quests;
