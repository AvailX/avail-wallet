import * as React from "react";
import * as mui from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";

// Components
import Layout from "../../views-desktop/reusable/layout";
import SideMenu from "../../components/sidebar";
import QuestBox from "../../components/quests/quest";
import TaskDrawer from "../../components/quests/tasks_drawer";

// Types
import { type CampaignDetailPageProps } from "../../types/quests/quest_types";
import { type Quest, Reward, Campaign } from "../../types/quests/quest_types";

// Images
import verified from "../../assets/icons/verified.svg";

// Typography
import { BodyText500 } from "../../components/typography/typography";

// Services
import { isQuestCompleted } from "../../services/quests/quests";

// Hooks
import { useLocation } from "react-router-dom";

// Alerts
import { SuccessAlert, ErrorAlert } from "../../components/snackbars/alerts";
import CreateQuestsBox from "./create_quests_box";

const CreateQuests: React.FC = () => {
  //dummy data

  const campaign: Campaign[] = [
    {
      id: "1",
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
      // points_image: 'https://i.imgur.com/vVySQ4o.png',
      // project_name: 'Avail',
    },
    {
      id: "2",
      title: "Aleo Wizards",
      subtitle: "NFTs on Aleo.",
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
      // points_image: 'https://i.imgur.com/vVySQ4o.png',
      //   project_name: 'Avail',
    },
    {
      id: "3",
      title: "Beta Staking",
      subtitle: "Staking on Aleo",
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
    },
  ];
  enum RewardMethod {
    LuckyDraw = "LuckyDraw",
    LeaderBoard = "LeaderBoard",
    FCFS = "FCFS",
  }
  const quests: Quest[] = [
    {
      id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
      title: "Mission 1",
      description: "Complete a transaction on the Avail Wallet.",
      display_image: "https://i.imgur.com/XhV1X68.png",
      tasks: [
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          points: 100,
        },
      ],
      reward: {
        id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
        collection_name: "Disruptors",
        amount: 100,
        method: RewardMethod.FCFS,
      },
      expires_on: new Date(),
      created_on: new Date(),
      campaign_id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
    },
    {
      id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
      title: "Mission 2",
      description: "Complete a transaction on the Avail Wallet.",
      display_image: "https://i.imgur.com/XhV1X68.png",
      tasks: [
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          points: 100,
        },
      ],
      reward: {
        id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
        collection_name: "Disruptors",
        amount: 100,
        method: RewardMethod.FCFS,
      },
      expires_on: new Date(),
      created_on: new Date(),
      campaign_id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
    },
    {
      id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
      title: "Mission 3",
      description: "Complete a transaction on the Avail Wallet.",
      display_image: "https://i.imgur.com/XhV1X68.png",
      tasks: [
        {
          id: "1",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          points: 100,
        },
      ],
      reward: {
        id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
        collection_name: "Disruptors",
        amount: 100,
        method: RewardMethod.FCFS,
      },
      expires_on: new Date(),
      created_on: new Date(),
      campaign_id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
    },
    {
      id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
      title: "Mission 4",
      description: "Complete a transaction on the Avail Wallet.",
      display_image: "https://i.imgur.com/XhV1X68.png",
      tasks: [
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          dapp_url: "https://app.arcane.finance",
          points: 100,
        },
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          dapp_url: "https://app.arcane.finance",
          points: 100,
        },
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          dapp_url: "https://app.arcane.finance",
          points: 100,
        },
        {
          id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
          title: "Complete a transaction on the Avail Wallet.",
          description: "Complete a transaction on the Avail Wallet.",
          transaction: true,
          program_id: "credits.aleo",
          function_id: "transfer_private",
          dapp_url: "https://app.arcane.finance",
          points: 100,
        },
      ],
      reward: {
        id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
        collection_name: "Disruptors",
        amount: 100,
        method: RewardMethod.FCFS || {},
      },
      expires_on: new Date(),
      created_on: new Date(),
      campaign_id: "e3e56506-9bcb-46f6-83a5-27aab7ddeb9d",
    },
  ];

  const location = useLocation();
  const state = location.state as CampaignDetailPageProps | undefined;
  // const campaign = state?.campaign;
  // const quests = state?.quests || [];

  const [quest, setQuest] = React.useState<Quest>(quests[0]);
  const [openTasks, setOpenTasks] = React.useState(false);
  const [questCompleted, setQuestCompleted] = React.useState(false);

  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const mdsx = mui.useMediaQuery("(min-width:850px)");
  const md = mui.useMediaQuery("(min-width:950px)");
  const mdlg = mui.useMediaQuery("(min-width:1150px)");
  const lgsx = mui.useMediaQuery("(min-width:1550px)");
  const lg = mui.useMediaQuery("(min-width:1750px)");
  const lgxl = mui.useMediaQuery("(min-width:1950px)");

 
   // code popup to edit the campaign name
    const [newCampaignName, setNewCampaignName] = React.useState("");

    const handleCampaignNameEntry = (event: React.ChangeEvent<HTMLInputElement>) => {
      
      setNewCampaignName(event.target.value);
    };

    // ...

    

  return (
    <Layout>
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
      <SideMenu />

      <mui.Box
        sx={{
          ml: md ? "5%" : "7%",
          display: "flex",
          flexDirection: "column",
          width: md ? "95%" : "93%",
        }}
      >
        <mui.Box
          sx={{
            background: `url(${campaign[0].bg_image})`,
            color: campaign[0].color,
            backgroundPosition: lgxl ? "center" : "bottom",
            height: lgxl ? "380px" : "320px",
            backgroundSize: "cover",
          }}
        >
          <mui.Box
            sx={{
              borderRadius: "100%",
              border: "1px solid #696969",
              p: 1.5,
              width: "200px",
              mt: lgxl
                ? "10%"
                : lg
                  ? "8%"
                  : lgsx
                    ? "10%"
                    : mdlg
                      ? "10%"
                      : md
                        ? "13%"
                        : mdsx
                          ? "14%"
                          : "17%",
              ml: "5%",
            }}
          >
            <mui.Box
              sx={{
                borderRadius: "50%", // Make the container circular
                border: "1px solid #696969",
                p: 1.5,
                width: "150px",
                height: "150px", // Ensure width and height are equal for a perfect circle
                mt: lgxl
                  ? "10%"
                  : lg
                    ? "8%"
                    : lgsx
                      ? "10%"
                      : mdlg
                        ? "10%"
                        : md
                          ? "13%"
                          : mdsx
                            ? "14%"
                            : "17%",
                ml: "5%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#D3D3D3",
              }}
            >
              <mui.IconButton sx={{ backgroundColor: "#696969", p: 2 }}>
                <CameraAltIcon sx={{ color: "#FFFFFF" }} />
              </mui.IconButton>
            </mui.Box>
          </mui.Box>
        </mui.Box>
        <mui.Box sx={{ ml: "2%", mt: "5%" }}>
          {/* Project's Title to edit */}
          <mui.Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleCampaignNameEntry}
          >
            <mui.Typography fontSize={"30px"} color="#FFF" fontWeight={"bold"}>
              {`Project Name`}
            </mui.Typography>
            <mui.IconButton
              sx={{
                color: "#FFF",
                marginRight: "8px",
                textSizeAdjust: "auto",
              }}
            >
              <EditIcon />
            </mui.IconButton>
          </mui.Box>

          {/* Projects description to edit */}
          <mui.Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleCampaignNameEntry}
          >
            <BodyText500 color="#A3A3A3" fontSize={"10px"}>
              {`Tap to edit the bio of your project`}
            </BodyText500>
            <mui.IconButton
              sx={{
                color: "#FFF",
                marginRight: "8px",
                textSizeAdjust: "auto",
              }}
            >
              <EditIcon />
            </mui.IconButton>
          </mui.Box>
        </mui.Box>
        <mui.Divider
          sx={{ width: "100%", height: "1px", bgcolor: "#00FFAA", mt: "3%" }}
          orientation="horizontal"
        />
        <mui.Box
          sx={{
            marginTop: "20px",
            alignItems: "center",
            mb: "5%",
            bgcolor: "#111111",
            alignSelf: "center",
            width: "90%",
            justifyContent: "space-around",
          }}
        >
          <CreateQuestsBox />
        </mui.Box>
      </mui.Box>
    </Layout>
  );
};

export default CreateQuests;
