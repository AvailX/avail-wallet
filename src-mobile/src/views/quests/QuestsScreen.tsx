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
// import Divider from "@mui/joy/Divider";
import {
  type Campaign,
  testCampaign,
} from "../../../../src/types/quests/quest_types";
import QuestsAppBarScroll from "../../components/quests/QuestsComponents/QuestsAppBarScroll";
import QuestsSection from "../../components/quests/QuestsComponents/QuestsSection";
import ConnectedQuestsGrid from "../../components/quests/QuestsComponents/QuestsGrid";
import { getCampaigns } from "../../../../src/services/quests/quests";
import { relative } from "path";

const QuestsScreen: React.FC = () => {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  console.log(campaigns);
  console.log("Campaigns");
  React.useEffect(() => {
    console.log("CampaignsINNN");
    getCampaigns()
      .then((campaigns) => {
        console.log("CampaignsINNN2222");
        console.log(campaigns);
        setCampaigns(campaigns);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const renderHorizontalScrollContainers = () => {
    return campaigns.map((campaigns, index) => (
      <QuestsAppBarScroll key={index} campaign={campaigns} />
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
      {/* <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "200px",
          mx: "-30px",
          px: 0,
          zIndex: "2",
        }}
      > */}
      <Box
        sx={{
          mt: 2,
          position: "relative",
          top: "4",
          px: 0,
          mx: "-20px",
          right: "0",
          // width: "100%",
          // overflowX: "hidden",
          // height: "100vh",

          maxHeight: "calc(100vh - 17%)", // Adjust the height to fill the remaining viewport height
          overflowY: "auto", // Enable vertical scrolling if content exceeds the container height
        }}
      >
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
      </Box>
      {/* </Box> */}

      <Box sx={{}}>
        {/* Quests screen */}
        {activeTab === "quests" && (
          <Box>
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
                  width: "100%",
                  // maxHeight: `${48 * campaigns.length}px`, // Calculate the height dynamically based on the number of items
                  // overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {/*This is the Row section of the container. placed at the bottom */}

                {campaigns.map((campaign) => (
                  <QuestsSection campaign={campaign} />
                  // <Divider />
                ))}
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
                  width: "100%",
                  // overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {campaigns.map((campaign) => (
                  <QuestsSection campaign={campaign} />
                ))}
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
                  width: "100%",
                  overflowX: "auto",
                  background: "#2A2A2A",
                  padding: "10px",
                  borderRadius: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {campaigns.map((campaign) => (
                  <QuestsSection campaign={campaign} />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Connected screen */}
        {activeTab === "launch-a-quest" && (
          <ConnectedQuestsGrid
            campaigns={campaigns}
            activeTab="launch-a-quest"
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default QuestsScreen;
