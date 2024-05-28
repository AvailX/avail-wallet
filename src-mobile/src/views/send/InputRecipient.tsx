import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import aleoGreen from "../../assets/alo-green.svg";
import recipientDown from "../../assets/recipient-down.svg";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLocation } from "react-router-dom";

function InputRecipient() {
  const location = useLocation();
  const { address } = location.state || {};
  return (
    <DashboardLayout>
      <Box>
        <Box>
          <Box
            bgcolor='#264139'
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            height='130px'
            px={3}
            mb={-2}
            borderRadius='9px'
          >
            <Box textAlign='left'>
              <Typography fontSize='30px' color='#B6B6B6' fontWeight={400}>
                969.00
              </Typography>
              <Typography color='#969696'>$6,749.30</Typography>
            </Box>
            <Box>
              <img src={aleoGreen} />
              <Typography fontWeight={700} fontSize='15px' color='#B6B6B6'>
                Balance: 0
              </Typography>
            </Box>
          </Box>
          <Box
            mx='auto'
            display='flex'
            alignItems='center'
            justifyContent='center'
            zIndex={100}
          >
            <img src={recipientDown} />
          </Box>
          <Box
            bgcolor='#264139'
            display='flex'
            alignItems='center'
            justifyContent='center'
            height='130px'
            zIndex={-1}
            mt={-2}
            borderRadius='9px'
          >
            <Typography fontSize='20px' fontWeight={700}>
              {address || "No address found."}
            </Typography>
          </Box>
        </Box>

        <TextButtons />

        <Button
          sx={{
            width: "100%",
            border: "0px",
            bgcolor: "#264139",
            color: "#00FFAA",
            mb: 7,
          }}
        >
          Send
        </Button>
      </Box>
    </DashboardLayout>
  );
}

const TextButtons = () => {
  const buttonText = [
    { text: "1", value: 1 },
    { text: "2", value: 2 },
    { text: "3", value: 3 },
    { text: "4", value: 4 },
    { text: "5", value: 5 },
    { text: "6", value: 6 },
    { text: "7", value: 7 },
    { text: "8", value: 8 },
    { text: "9", value: 9 },
    { text: ".", value: "." },
    { text: "0", value: 0 },
    {
      text: "B",
      value: <ArrowBackIcon sx={{ color: "#fff", fontSize: "40px" }} />,
    },
  ];
  const [text, setText] = useState<string>("");
  const handleButtonClick = (value: string) => {
    if (value === "." && text.includes(".")) {
      return;
    }
    if (value === "B") {
      setText(text.slice(0, -1));
    } else {
      setText(text + value);
    }
  };
  return (
    <>
      <h1 style={{ color: "red" }}>{text}</h1>
      <Box
        width='100%'
        display='grid'
        gridTemplateColumns='1fr 1fr 1fr'
        gap='5px'
        my={5}
      >
        {buttonText.map(({ text, value }) => (
          <Box
            key={text}
            display='flex'
            alignItems='center'
            onClick={() => handleButtonClick(text)}
            justifyContent='center'
            sx={{ cursor: "pointer" }}
          >
            <Typography fontSize='40px' fontWeight={500} textAlign='center'>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default InputRecipient;
