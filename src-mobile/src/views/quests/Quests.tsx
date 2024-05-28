import * as React from "react";
import { styled } from "@mui/system";
import { Box, Typography, Divider as MuiDivider } from "@mui/material";
import Background from "../../components/quests/Background";
import ProfileContainer from "../../components/quests/ProfileContainer";
import NewContainer from "../../components/quests/NewContainer";
import TaskDrawer from "../../components/quests/Tasks/TasksDrawer"; // Import the TaskDrawer component
import verified from "../../assets/icons/verified.svg"; // Import the verified icon
import { Quest, quests, RewardMethod, Campaign } from "../../types/quests/quest_types";

const Container = styled(Box)({
  position: "relative",
  overflow: "visible",
  backgroundColor: "black",
  paddingBottom: "100px",
  color: "white",
  minHeight: "100vh",
});

const TransparentBackground = styled(Box)({
  position: "relative",
  height: "240px",
  display: "flex",
  marginTop: "-45px",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
});

const ProfileText = styled(Box)({
  marginLeft: "5%",
  right: "10px",
});

const Divider = styled(MuiDivider)({
  marginTop: "10px",
  mb: "10px",
  backgroundColor: "#00FFAA",
});

const Quests: React.FC = () => {
  const [openTasks, setOpenTasks] = React.useState(false);
  const [quest, setQuest] = React.useState<Quest>(quests[3]);
  const [selectedQuest, setSelectedQuest] = React.useState(null);

  const handleQuestClick = (quest: any) => {
    setSelectedQuest(quest);
    setOpenTasks(true);
  };

  const handleResetSelectedQuest = () => {
    setSelectedQuest(null);
  };

  return (
    <Container>
      <TransparentBackground>
        <Background bgImage={campaign[0].bg_image} />
        <ProfileContainer
          profileImageSrc={campaign[0].profile_image}
          verifiedBadgeSrc={verified}
        />
      </TransparentBackground>
      <ProfileText>
        <Typography fontSize={"16px"}>{campaign[0].title}</Typography>
        <Typography fontSize={"13px"}>
          {campaign[0].inner_description}
        </Typography>
      </ProfileText>
      <Divider />
      {quests.map((quest, index) => (
        <NewContainer
          key={index}
          title={quest.title}
          description={quest.description}
          bgImage={quest.display_image}
          onClick={() => handleQuestClick(quest)}
        />
      ))}
      {selectedQuest && (
        <TaskDrawer
          open={openTasks}
          onClose={() => {
            setOpenTasks(false);
            handleResetSelectedQuest(); // Reset selectedQuest state
          }}
          quest={quest}
        />
      )}
    </Container>
  );
};

export default Quests;


// Sample campaign data
export const campaign: Campaign[] = [
  {
    id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
    title: "Disruptors",
    subtitle: "Avail - Privacy unlocked.",
    description: {
      part1: "Complete Weekly",
      main: "Quests",
      part2: "Win Disruptors",
    },
    inner_description:
      "The Disruptors are the official NFT of the Avail Wallet.",
    box_image: "https://i.imgur.com/IzWdTWR.png",
    bg_image: "https://i.imgur.com/bPfHEJt.png",
    profile_image: "https://i.imgur.com/gXfvvaJ.png",
    color: "#00FFAA",
    points_image: 'https://i.imgur.com/vVySQ4o.png',
    project_name: 'Avail',
  },
];

