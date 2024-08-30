// Types
import { type Task, type Quest } from 'src/types/quests/quest_types';
import greenGlow from '../../assets/dapps/gglow.png';

// Components
import TaskBox from './task';
import Close from '@mui/icons-material/Close';
import { SubMainTitleText } from '../typography/typography';

// Services
import { isQuestCompleted } from '../../services/quests/quests';
import { FC, useState, useEffect } from 'react';
import { Drawer, Box, IconButton } from '@mui/material';

export type TaskDrawerProps = {
  open: boolean;
  onClose: () => void;
  quest: Quest;
};

const TaskDrawer: FC<TaskDrawerProps> = ({ open, onClose, quest }) => {
  const [questCompleted, setQuestCompleted] = useState(false);

  useEffect(() => {
    isQuestCompleted(quest.id)
      .then((res) => {
        if (res) {
          setQuestCompleted(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [quest]);

  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          height: '95%', // Drawer height
          backgroundImage: `linear-gradient(to right, transparent 100%, #171717 0%),url(${greenGlow})`,
          backgroundSize: 'cover',
          bgcolor: '#171717',
          width: '90%',
          alignSelf: 'center',
          ml: '7.5%',
        },
        alignSelf: 'center',
      }}
    >
      {/* Close button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose}>
          <Close sx={{ color: '#a3a3a3' }} />
        </IconButton>
      </Box>

      <SubMainTitleText sx={{ color: '#fff', ml: '5%' }}>
        Tasks
      </SubMainTitleText>

      {/* Quest title */}
      {quest.tasks.map((task) => (
        <TaskBox
          key={task.id}
          task={task}
          quest={quest}
          questCompleted={questCompleted}
        />
      ))}
    </Drawer>
  );
};

export default TaskDrawer;
