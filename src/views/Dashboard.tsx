import { Box, Button, IconButton, Typography } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import AssestCard from "../components/AssestCard";
import DashboardHeader from "../components/DashboardHeader";

import diamondShinyIcon from "../assets/diamond-shiny-icon.svg";
import sendIcon from "../assets/send-icon.svg";
import receiveIcon from "../assets/receive-icon.svg";

import availLogo from "../assets/avail-icon.svg";
import NftDisplay from "../components/NftDisplay";
import NftDetailsDisplay from "../components/NftDetailsDisplay";
import {
  CompletedDisplay,
  PendingDisplay,
} from "../components/ActivityStatusCard";
import SwipeableEdgeDrawer from "../components/SwipeableDrawer";
import React, { useState } from "react";
import ActivityDetails from "../components/ActivityDetails";
import AsssetDisplay from "../components/AsssetDisplay";
import DashboardCarousel from "../components/DashboardCarousel";
import { Link, useNavigate } from "react-router-dom";
import { get_address } from "../../src-desktop/services/storage/persistent";

const Dashboard = () => {
  const navigate = useNavigate();
  const goToOther = () => {
    navigate("/secret-recovery");
  };
  const DASHBOARD_ITEMS = [
    { icon: diamondShinyIcon, path: "" },
    { icon: sendIcon, path: "/send" },
    { icon: receiveIcon, path: "" },
    { icon: receiveIcon, path: "" },
  ];

  const airdropNftData = [
    { whitelist_img: availLogo, name: "Airdrop NFT 1" },
    { whitelist_img: availLogo, name: "Airdrop NFT 2" },
    { whitelist_img: availLogo, name: "Airdrop NFT 3" },
  ];

  const [open, setOpen] = React.useState<boolean>(false);
  const toggleDrawer = (newOpen: boolean) => (): void => {
    setOpen(newOpen);
  };

  const [activeTab, setActiveTab] = useState("assets");

  const [openActivityDetails, setOpenActivityDetails] = useState(false);
  const toggleActivityDetails = (newOpen: boolean) => (): void => {
    setOpenActivityDetails(newOpen);
  };
  let address = get_address().then((data) => {
    console.log("address", data);
  });
  const sampleData = {
    recipient: "@zack_x",
    date: "12 Mar at 2:34 PM",
    transactionDetails: [
      { title: "Transaction hash", value: "at13wfnwclps34..." },
      { title: "Network", value: "Aleo" },
      { title: "Network Fee", value: "$0.001 • 0.00166 ALEO" },
      { title: "Total est", value: "$90.86 " },
    ],
    transactions: [
      {
        imageUrl:
          "https://s3-alpha-sig.figma.com/img/b54a/8610/d906fd0744803a5ded08dd34492621f6?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hSZoVruiksWEFRAiZwIaC6xWoG3LHh~UQpAIqwYzPxud7G6WsDnIKIC7k93E5u~VGSsNHfmyCKn9SspO7EoOaGOf0JXzzkhLyvAJTuaiEceqR-5j-6pysTg5lF72FZdyorymsHPOrUmsJeRaS66x7qi-r5I~9bzkWli~wfIrexkN4aHiGJC7AGzOO7t7Lbqo5sHR8pS9roHCpq8UCxK-WgvmiJ84g~vB0g~W47jppo7ruBZVwNWxM71NFyZ~31y3Yg4~DD3Onm-ayhgvLobb4NEjJmGBDC9eAVeoeIRhC7x446CJl5bFCIObuwhlHwSAXEw0C8UFEtWqAIcZOJ6aYA__",
        from: "G Block",
        amount: "-$90.87",
        aleo: "146.7 ALEO",
      },
      // Additional transactions can be added here
    ],
  };

  return (
    <>
      <DashboardLayout>
        <DashboardHeader
          onProfileClick={(): void => {
            setOpen(true);
          }}
        />
        <Typography color='#fff'>Total Balance</Typography>
        <Typography
          sx={{ textShadow: "0 0 15px #00FFAA" }}
          color='#00FFAA'
          fontWeight={600}
          fontSize='40px'
        >
          $48,000.00
        </Typography>
        <Typography color='#01FFAA'>+450.6%</Typography>
        <Box
          display='flex'
          alignItems='center'
          my={3}
          justifyContent='space-between'
          width='90%'
          mx='auto'
        >
          {DASHBOARD_ITEMS.map(({ icon, path }, i) => (
            <Box
              borderRadius='9px'
              component={Button}
              onClick={() => {
                console.log("Clicked");
                navigate(path);
              }}
              sx={{ border: "none" }}
              p={1}
              height='63px'
              width='62px'
              display='flex'
              alignItems='center'
              justifyContent='center'
              bgcolor='#2A2A2A'
              key={i}
            >
              <img src={icon} />
            </Box>
          ))}
        </Box>

        <Box display='flex' mb={2}>
          <Typography
            fontWeight={500}
            borderBottom={activeTab === "assets" ? "1px solid #FFFFFF" : ""}
            fontSize='20px'
            width='content-fit'
            mr={2}
            onClick={() => {
              setActiveTab("assets");
            }}
          >
            Assets
          </Typography>

          <Typography
            fontWeight={500}
            fontSize='20px'
            width='content-fit'
            borderBottom={activeTab === "nft" ? "1px solid #FFFFFF" : ""}
            mr={2}
            onClick={() => {
              setActiveTab("nft");
            }}
          >
            NFT
          </Typography>
          <Typography
            fontWeight={500}
            fontSize='20px'
            width='content-fit'
            borderBottom={activeTab === "activity" ? "1px solid #FFFFFF" : ""}
            onClick={() => {
              setActiveTab("activity");
            }}
          >
            Activity
          </Typography>
        </Box>

        <DashboardCarousel />

        {activeTab === "activity" && (
          <>
            <PendingDisplay
              onClick={() => {
                setOpenActivityDetails(true);
              }}
            />
            <CompletedDisplay />
          </>
        )}

        {activeTab === "nft" && (
          <NftDisplay onClick={() => setActiveTab("nftDetails")} />
        )}

        {activeTab === "nftDetails" && <NftDetailsDisplay />}

        {activeTab === "assets" && (
          <>
            <AsssetDisplay />
          </>
        )}
      </DashboardLayout>
      <SwipeableEdgeDrawer open={open} toggleDrawer={toggleDrawer} />
      <SwipeableEdgeDrawer
        open={openActivityDetails}
        toggleDrawer={toggleActivityDetails}
      >
        <ActivityDetails {...sampleData} />
      </SwipeableEdgeDrawer>
    </>
  );
};

export default Dashboard;
