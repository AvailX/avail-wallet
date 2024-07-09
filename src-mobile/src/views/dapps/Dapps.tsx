import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import DappsAppBar from "../../components/dapps/DappsAppBar";
import { Dapp } from "../../types/dapps/types";
import ConnectedDappsGrid from "../../components/dapps/ConnectedDappsGrid";
import HorizontalScrollContainer from "../../components/dapps/HorizontalScrollContainer";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import img from "../assets/connected-dapp.svg";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import DappsSection from "../../components/dapps/DappsSection";
import { displayDapps, dapps } from "../../assets/dapps/dapps";

// interface DappsPageProps {
//   dapps: Dapp[];
// }

// const DappsPage: React.FC<DappsPageProps> = ({ dapps }) => {
const DappsPage = () => {
  const renderHorizontalScrollContainers = () => {
    return dapps.map((dapp, index) => (
      <HorizontalScrollContainer key={index} dapp={dapp} />
    ));
  };
  const [activeTab, setActiveTab] = useState("explore");

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
      <DappsAppBar activeTab={activeTab} onTabChange={handleTabChange} />

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
        {/* Explore screen */}
        {activeTab === "explore" && (
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

            {/* Exchange Section */}
            <Box>
              {/* Title */}
              <Typography
                mt="22px"
                fontSize={25}
                sx={{ color: "#ffffff", fontWeight: "bold", textAlign: "left" }}
              >
                {" "}
                Exchanges
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
                {/*This is the Row section of the container. placed at the bottom */}
                {dapps.map((dapp, index) => (
                  <DappsSection title="Exchanges" dapp={dapp} />
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
                Staking
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
                {/*This is the Row section of the container. placed at the bottom */}
                {dapps.map((dapp, index) => (
                  <DappsSection title="Exchanges" dapp={dapp} />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Connected screen */}
        {activeTab === "connected" && (
          <ConnectedDappsGrid dapps={dapps} activeTab="connected" />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default DappsPage;
