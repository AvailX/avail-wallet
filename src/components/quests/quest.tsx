// Types
import { type Quest } from '../../types/quests/quest_types';

// Typography
import { SubMainTitleText } from '../typography/typography';

// Services
import { isQuestCompleted } from '../../services/quests/quests';

// Components
import TaskDrawer from './tasks_drawer';

// Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from '@mui/material';
import { FC, useState, useRef, useEffect } from 'react';

type QuestBoxProps = {
  quest: Quest;
  openTasks: boolean;
  setOpenTasks: (value: boolean) => void;
  setQuest: (value: Quest) => void;
};

function formateDateString(date: string) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const QuestBox: FC<QuestBoxProps> = ({
  quest,
  openTasks,
  setOpenTasks,
  setQuest,
}) => {
  const [completed, setCompleted] = useState(false);

  const shouldRunEffect = useRef(true);
  useEffect(() => {
    if (shouldRunEffect.current) {
      isQuestCompleted(quest.id)
        .then((res) => {
          console.log('Quest complete ? : ', res);
          if (res) {
            setCompleted(true);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      shouldRunEffect.current = false;
    }
  }, []);

  return (
    <Box
      sx={{
        width: '450px',
        backgroundImage: `linear-gradient(to right, #000 40%, transparent 60%),url(${quest.display_image})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 5,
        padding: '20px',
        height: '250px',
        border: '1px solid #404040',
        mt: '2%',
        cursor: 'pointer',
        transition:
          'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        },
      }}
      onClick={() => {
        setQuest(quest);
        setOpenTasks(true);
      }}
    >
      <SubMainTitleText color='#FFF' sx={{ backdropFilter: 'blur(2px)' }}>
        {quest.title}
      </SubMainTitleText>
      <Typography
        variant='body1'
        color='#fff'
        sx={{ mb: '13%', backdropFilter: 'blur(2px)' }}
      >
        {quest.description}
      </Typography>
      {quest.reward.method.toString() === 'LuckyDraw' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant='h4'
            color='#FFF'
            sx={{ backdropFilter: 'blur(2px)' }}
          >
            {' '}
            Chance to Win {quest.reward.collection_name} Whitelist
          </Typography>
          <Typography variant='body1' color='#00FFAA'>
            {' '}
            Allocation {quest.reward.amount}{' '}
          </Typography>
        </Box>
      ) : quest.reward.method.toString() === 'FCFS' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h4' color='#FFF'>
            {' '}
            First {quest.reward.amount} to complete.
          </Typography>
          <Typography variant='body1' color='#00FFAA'>
            {' '}
            Gets {quest.reward.collection_name} Whitelist{' '}
          </Typography>
        </Box>
      ) : (
        <Typography variant='body1' color='#A3A3A3'>
          Leaderboard: {quest.reward.amount} {quest.reward.collection_name}
        </Typography>
      )}
      {completed ? (
        <CheckCircleIcon
          sx={{ color: '#00FFAA', width: '35px', height: '35px' }}
        />
      ) : (
        <Typography variant='body1' color='#A3A3A3' sx={{ mt: '2%' }}>
          Expires on: {formateDateString(quest.expires_on.toString())}
        </Typography>
      )}
    </Box>
  );
};

export default QuestBox;
