import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Dapp } from "../../types/dapps/types";
import ConnectedDappsGrid from "../../components/dapps/ConnectedDappsGrid";
import HorizontalScrollContainer from "../../components/dapps/HorizontalScrollContainer";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import DappsSection from "../../components/dapps/DappsSection";
import QuestsAppBar from "../../components/quests/QuestsComponents/QuestsAppBar";
import { Campaign } from "../../types/quests/quest_types";
import QuestsAppBarScroll from "../../components/quests/QuestsComponents/QuestsAppBarScroll";
import QuestsSection from "../../components/quests/QuestsComponents/QuestsSection";
import ConnectedQuestsGrid from "../../components/quests/QuestsComponents/QuestsGrid";

interface QuestsPageProps {
  campaign: Campaign[];
}

const QuestsScreen: React.FC<QuestsPageProps> = ({ campaign }) => {
  const renderHorizontalScrollContainers = () => {
    return campaign.map((campaign, index) => (
      <QuestsAppBarScroll key={index} campaign={campaign} />
    ));
  };
  const [activeTab, setActiveTab] = useState("quests");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const responsive = {
    superLargeDesktop: {
      // The naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
      partialVisibilityGutter: 40,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      partialVisibilityGutter: 40,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      partialVisibilityGutter: 40,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      partialVisibilityGutter: 40,
    },
  };

  return (
    <DashboardLayout>
      <QuestsAppBar activeTab={activeTab} onTabChange={handleTabChange} />

      <Box
        sx={{
          position: "absolute",
          top: "17%",
          left: "3%",
          width: "100%",

          maxHeight: "calc(100vh - 17%)", // Adjust the height to fill the remaining viewport height
          overflowY: "auto", // Enable vertical scrolling if content exceeds the container height
        }}
      >
        {/* Quests screen */}
        {activeTab === "quests" && (
          <Box>
            <Carousel
              swipeable={true}
              partialVisible={true}
              draggable={true}
              responsive={responsive}
              minimumTouchDrag={200}
              autoPlay={false}
              autoPlaySpeed={10_000}
              customTransition="all .5"
              transitionDuration={1000}
              containerClass="carousel-container"
              removeArrowOnDeviceType={["tablet", "mobile"]}
            >
              {renderHorizontalScrollContainers()}
            </Carousel>

            {/* Quests Ending Soon Section */}
            <Box>
              {/* Title */}
              <Typography
                mt="22px"
                fontSize={25}
                sx={{ color: "#ffffff", fontWeight: "bold", textAlign: "left" }}
              >
                {" "}
                <span style={{ color: "#01f0a0" }}> Quests</span> Ending Soon!
              </Typography>

              {/* Container for the exchange item */}

              <Box
                sx={{
                  position: "relative",
                  width: "340px",
                  maxHeight: `${48 * campaign.length}px`, // Calculate the height dynamically based on the number of items
                  overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {/*This is the Row section of the container. placed at the bottom */}
                <QuestsSection campaign={campaign} />
                <QuestsSection campaign={campaign} />
                <QuestsSection campaign={campaign} />
              </Box>
            </Box>

            {/* Another container */}
            <Box>
              {/* Title */}
              <Typography
                mt="22px"
                fontSize={25}
                sx={{ color: "#ffffff", fontWeight: "bold", textAlign: "left" }}
              >
                {" "}
                Newest <span style={{ color: "#01f0a0" }}> Quests</span>
              </Typography>

              {/* Container for the exchange item */}

              <Box
                sx={{
                  position: "relative",
                  width: "340px",
                  overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <QuestsSection campaign={campaign} />
                <QuestsSection campaign={campaign} />
              </Box>
            </Box>

            {/* Another container */}
            <Box>
              {/* Title */}
              <Typography
                mt="22px"
                fontSize={25}
                sx={{ color: "#ffffff", fontWeight: "bold", textAlign: "left" }}
              >
                {" "}
                Completed <span style={{ color: "#01f0a0" }}> Quests</span>
              </Typography>

              {/* Container for the exchange item */}

              <Box
                sx={{
                  position: "relative",
                  width: "340px",
                  overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <QuestsSection campaign={campaign} />
              </Box>
            </Box>
          </Box>
        )}

        {/* Connected screen */}
        {activeTab === "launch-a-quest" && (
          <ConnectedQuestsGrid
            campaigns={campaign}
            activeTab="launch-a-quest"
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default QuestsScreen;
