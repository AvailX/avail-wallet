import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { type NotificationProps } from '../../types/notification';
import loan_accepted_icon from '../../assets/notification-icons/nloan_accepted.svg';
import loan_request_icon from '../../assets/notification-icons/nloan_request.svg';
import payment_icon from '../../assets/notification-icons/npayment.svg';
import heart_icon from '../../assets/notification-icons/nheart.svg';
import contract_icon from '../../assets/notification-icons/ncontract.svg';
import announcement_icon from '../../assets/notification-icons/nannouncement.svg';
import { Box, alpha, Typography } from '@mui/material';
import { FC, useState, useEffect } from 'react';

const icons = [
  {
    type: 'loan_accepted',
    icon: loan_accepted_icon,
  },
  {
    type: 'info',
    icon: announcement_icon,
  },
  {
    type: 'contract_request',
    icon: contract_icon,
  },
  {
    type: 'loan_oppurtinity',
    icon: loan_request_icon,
  },
  {
    type: 'payment',
    icon: payment_icon,
  },
  {
    type: 'support',
    icon: heart_icon,
  },
];

const Notification: FC<NotificationProps> = ({
  notif_type,
  nmessage,
  sub_message,
  link,
}) => {
  const navigate = useNavigate();
  const [icon, setIcon] = useState<string>('');

  useEffect(() => {
    setIcon(icons.find((i) => i.type === notif_type)?.icon || '');
  }, [notif_type]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        bgcolor: alpha('#3A3A3A', 0.4),
        borderRadius: '10px',
        p: '5px',
      }}
    >
      <img
        src={icon}
        style={{ width: '20%', height: 'auto', marginRight: '3%' }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#fff', fontSize: '1rem' }}>
          {nmessage}
        </Typography>
        <Box
          sx={{ display: 'flex', flexDirection: 'row', gap: '1.5%' }}
          onClick={() => {
            if (!sub_message && link) {
              navigate(link);
            }
          }}
        >
          <Typography sx={{ color: '#00FFAA', fontSize: '0.9rem' }}>
            {sub_message ? sub_message : 'Check it out'}
          </Typography>
          {!sub_message && (
            <ArrowForwardIcon
              sx={{ color: '#00FFAA', width: '15px', height: '15px' }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Notification;
