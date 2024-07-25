import { Box, Typography } from "@mui/material";

import arrowUp from "../assets/arrow-up.svg";
import buyIcon from "../assets/buy.svg";
import { FC } from "react";

type IPendingCard = {
  type: "transfer" | "buy";
  title: string;
  status: string;
  amount: number;
  fee: number;
  onClick?: () => void;
};

export const PendingCard: FC<IPendingCard> = ({
  type = "buy",
  status,
  amount,
  fee,
  title,
  onClick,
}) => {
  return (
    <Box
      onClick={onClick}
      display='flex'
      alignItems='center'
      my={0.5}
      justifyContent='space-between'
      borderBottom='1px solid #353535'
      pb='5px'
    >
      <Box display='flex' alignItems='center'>
        <Box
          bgcolor='#111111'
          display='flex'
          alignItems='center'
          justifyContent='center'
          width='41px'
          height='41px'
          borderRadius='4px'
          mr={1}
        >
          <img src={type === "buy" ? buyIcon : arrowUp} />
        </Box>
        <Box textAlign='left'>
          <Typography fontWeight={400} fontSize='15px'>
            {title}
          </Typography>
          <Typography
            fontSize='10px'
            color={status === "Canceled" ? "red" : "#00FFAA"}
          >
            {status === "Pending" ? "In process" : "Canceled"}
          </Typography>
        </Box>
      </Box>
      <Box textAlign='right'>
        <Typography fontSize='17px' fontWeight={700}>
          {amount} USDT
        </Typography>
        <Typography fontSize='10px' color='#00FFAA'>
          Fee {fee}
        </Typography>
      </Box>
    </Box>
  );
};

interface IProps {
  onClick: () => void;
}

export const PendingDisplay: FC<IProps> = ({ onClick }) => {
  const pendingCards: IPendingCard[] = [
    {
      type: "buy",
      title: "Buy USDT",
      status: "Pending",
      amount: 150.0,
      fee: 5.0,
    },
    {
      type: "transfer",
      title: "Transfer to Savings",
      status: "Completed",
      amount: 500.0,
      fee: 10.0,
    },
  ];
  return (
    <Box>
      <Typography fontSize='25px' mb={1} fontWeight={700} textAlign='left'>
        Pending
      </Typography>
      <Box borderRadius='9px' bgcolor='#2a2a2a' p={2}>
        {pendingCards.map((item, i) => (
          <PendingCard onClick={onClick} {...item} key={i} />
        ))}
      </Box>
    </Box>
  );
};

export const CompletedDisplay = () => {
  const compledtedCards: IPendingCard[] = [
    {
      type: "buy",
      title: "Swap from USDT to ALO",
      status: "Canceled",
      amount: 100.0,
      fee: 5.0,
    },
    {
      type: "transfer",
      title: "Transfer to Savings",
      status: "Completed",
      amount: 500.0,
      fee: 10.0,
    },
  ];
  return (
    <Box mt={2}>
      <Typography fontSize='25px' mb={1} fontWeight={700} textAlign='left'>
        Completed
      </Typography>
      <Box borderRadius='9px' bgcolor='#2a2a2a' p={2}>
        {compledtedCards.map((item, i) => (
          <PendingCard {...item} key={i} />
        ))}
      </Box>
    </Box>
  );
};
