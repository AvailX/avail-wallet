import * as React from "react";
import * as mui from "@mui/material";

// Components
import Layout from "../reusable/layout";
import SideMenu from "../../components/sidebar";
import CampaignView from "../../components/quests/campaign";
import greenGlow from "../../assets/images/backgrounds/gglow_quests.png";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Typography
import { LargeTitleText } from '../../components/typography/typography';

// Testing
import { type Campaign, testCampaign } from '../../types/quests/quest_types';

// Services
import { useNavigate } from "react-router-dom";
import { createCampaign, getCampaigns } from '../../services/quests/quests';
import { invoke } from '@tauri-apps/api/core';

function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);

  React.useEffect(() => {
    getCampaigns()
      .then((campaigns) => {
        setCampaigns(campaigns);
        console.log('Campaigns:', campaigns);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);



  return (
    <Layout>
      <SideMenu />
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: "3%",
          justifyContent: "center",
          alignItems: "center",
          background: "url(" + greenGlow + ") no-repeat ",
          paddingBottom: "7%",
        }}
      >
        <LargeTitleText sx={{ color: "#FFF" }}> Web3 Privacy</LargeTitleText>
        <LargeTitleText
          sx={{ color: "#00FFAA", textShadow: "0 0 10px #00FFAA" }}
        >
          {" "}
          Quests{" "}
        </LargeTitleText>
        <mui.Stack direction="row" spacing={2} mt="15px">
          <mui.Box
            sx={{
              display: "inline-block",
              width: "150px",
              p: "1.5px",
              borderRadius: "15px",
              background: "linear-gradient(90deg, #00FFAA, #840099)",
              transition: "box-shadow 0.3s ease-in-out",
              "&:hover": {
                boxShadow:
                  "0 0 5px rgba(0, 255, 170, 0.5), 0 0 10px rgba(132, 0, 153, 0.5)",
              },
            }}
          >
            <mui.Box
              sx={{
                background: "#000",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow:
                    "inset 0 0 10px rgba(0, 255, 170, 0.3), inset 0 0 20px rgba(132, 0, 153, 0.3)",
                },
              }}
            >
              <mui.Button
                onClick={() => {
                  // navigate("/quests");
                  console.log("INFO: Explore now -- Clicked");
                }}
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  borderRadius: "15px",
                  alignItems: "center",
                  color: "white",
                  fontSize: "12px",
                  justifyContent: "center",
                  boxShadow:
                    "0 0 5px rgba(0, 255, 170, 0.5), 0 0 5px rgba(132, 0, 153, 0.5)",
                }}
              >
                Explore now
              </mui.Button>
            </mui.Box>
          </mui.Box>
          <mui.Box>
            <mui.Button
              onClick={() => {
                navigate('/create-quests');
                console.log("INFO: Create a quest -- Clicked");
              }}
              sx={{
                borderRadius: "15px",
                color: "#01FFAA",
                fontSize: "12px",
              }}
              endIcon={<ChevronRightIcon />}
            >
              Create a quest
            </mui.Button>
          </mui.Box>
          
        </mui.Stack>
      </mui.Box>
      <mui.Box>
            <mui.Button
              onClick={() => {navigate('/qaastest')}}
              sx={{
                borderRadius: "15px",
                color: "#01FFAA",
                fontSize: "12px",
              }}
              endIcon={<ChevronRightIcon />}
            >
              test qaas flow
            </mui.Button>
          </mui.Box>
      <mui.Box sx={{ display: "flex", flexDirection: "column", mt: "3%" }}>
        {campaigns.map((campaign) => (
          <CampaignView {...campaign} key={campaign.id} />
        ))}
      </mui.Box>
    </Layout>
  );
}

export default Campaigns;
