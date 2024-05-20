import { Box, Divider, Typography } from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";

type ActivityDetailsProps = {
  recipient: string;
  date: string;
  transactionDetails: {
    title: string;
    value: string;
  }[];
  transactions: {
    imageUrl: string;
    from: string;
    amount: string;
    aleo: string;
  }[];
};

const ActivityDetails = ({
  recipient,
  date,
  transactionDetails,
  transactions,
}: ActivityDetailsProps) => {
  return (
    <Box color='#fff'>
      <Box display='flex' alignItems='center'>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          bgcolor='#111111'
          mr={2}
          p={2}
          borderRadius='4px'
        >
          <NorthEastIcon />
        </Box>
        <Box>
          <Typography fontSize='17px'>Sent to {recipient}</Typography>
          <Typography fontSize='10px'>{date}</Typography>
        </Box>
      </Box>
      <Divider
        sx={{ width: "100%", height: "1px", bgcolor: "#353535", mt: 2 }}
      />

      {transactions.map((transaction, index) => (
        <TransactionTransport key={index} {...transaction} />
      ))}

      {transactionDetails.map(({ title, value }, index) => (
        <Box
          key={index}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          borderTop='1px solid #353535'
          py={2}
        >
          <Typography>{title}</Typography>
          <Typography>{value}</Typography>
        </Box>
      ))}

      <Box
        display='flex'
        alignItems='center'
        mt={2}
        pb={4}
        justifyContent='flex-end'
      >
        <Typography color='#00FFAA' fontSize='20px'>
          Explorer{" "}
        </Typography>
        <Box
          width='15px'
          display='flex'
          alignItems='center'
          justifyContent='center'
          p={2}
          border='1px solid #fff'
          borderRadius='50%'
          height='15px'
          ml={2}
        >
          <NorthEastIcon sx={{ color: "#fff", fontSize: "15px" }} />
        </Box>
      </Box>
    </Box>
  );
};

type TransactionTransportProps = {
  imageUrl: string;
  from: string;
  amount: string;
  aleo: string;
};

const TransactionTransport = ({
  imageUrl,
  from,
  amount,
  aleo,
}: TransactionTransportProps) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      my={2}
    >
      <Box display='flex' alignItems='center'>
        <img
          width='35px'
          style={{ borderRadius: "50%" }}
          height='35px'
          src={imageUrl}
        />
        <Box ml={2} display='flex' alignItems='center'>
          <Typography>From</Typography>
          <Typography color='#CAC4D0' ml={1}>
            {from}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography fontSize='18px' fontWeight={500}>
          {amount}
        </Typography>
        <Typography fontSize='14px' fontWeight={400}>
          {aleo}
        </Typography>
      </Box>
    </Box>
  );
};

export default ActivityDetails;
