/* eslint-disable @typescript-eslint/padding-line-between-statements */
import * as React from "react";
import * as mui from "@mui/material";

// Components
import Layout from "../../../views-desktop/reusable/layout";
import SideMenu from "../../../components/sidebar";
import ProjectTitle from "../CreateQuests/CreateProjectTitle";
import ProjectBio from "../CreateQuests/CreateProjectBio";
import CoverImage from "../CreateQuests/CreateCoverImage";
import CreateQuestsBox from "../create_quests_box";
import EditableProfileAndTitle from "./EditableProfileAndTitle";
import CreateQuestsCard from "./CreateQuestsCard";

// Types
import {
  type CampaignDetailPageProps,
  campaign,
  quests,
  Campaign,
  questsEmpty,
} from "../../../types/quests/quest_types";

// Typography
import { BodyText500 } from "../../../components/typography/typography";

// Hooks
import { useLocation, useNavigate } from "react-router-dom";

// Alerts
import { SuccessAlert, ErrorAlert } from "../../../components/snackbars/alerts";
import ProfileImage from "./CreateProfilePicture";
import { set } from "date-fns";
import { createCampaign } from "../../../services/quests/quests";
import { ForkLeft } from "@mui/icons-material";
import ScanReAuthDialog from "../../../components/dialogs/reauth";

const CreateQuests: React.FC = () => {
  const location = useLocation();
  const state = location.state as CampaignDetailPageProps | undefined;
  const navigate = useNavigate();
  const [defaultCoverImage, setDefaultCoverImage] = React.useState("");
  const [defaultProfileImage, setDefaultProfileImage] = React.useState("");
  const [reAuthDialogOpen, setReAuthDialogOpen] = React.useState(false);

  const [returnCampaign, setReturnCampaign] = React.useState<Campaign>();
  // Helper function to convert hex to RGBA
  const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const [newCampaignName, setNewCampaignName] = React.useState("Project Title");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newCampaignBio, setNewCampaignBio] = React.useState("Project Bio");
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [newCoverImage, setNewCoverImage] = React.useState(
    campaign[0].bg_image || ""
  );
  const [newPPImage, setNewPPImage] = React.useState(
    campaign[0].profile_image || ""
  );
  const [isEditingCover, setIsEditingCover] = React.useState(false);
  const [isEditingPP, setIsEditingPP] = React.useState(false);
  const [coverImageError, setCoverImageError] = React.useState(false);
  const [ppImageError, setPPImageError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState("Your changes have been saved");
  const [projectImage, setProjectImage] = React.useState(
    campaign[0].profile_image || ""
  );
  const [projectTitle, setProjectTitle] = React.useState("Project Title"); // New state for project title
  const [projectName, setProjectName] = React.useState("Campaign Name"); // Separate state for project name
  const [boxImage, setBoxImage] = React.useState<string>(
    "https://i.imgur.com/IzWdTWR.png"
  );
  // const [title, setTitle] = React.useState<string>("Disruptors");
  // const [subtitle, setSubtitle] = React.useState<string>(
  //   "Avail - Your Gateway to Privacy"
  // );
  const [description, setDescription] = React.useState<{
    part1: string;
    main: string;
    part2: string;
  }>({ part1: "Complete Weekly", main: "Quests", part2: "Win Disruptors" });
  const [color, setColor] = React.useState<string>("#00FFAA");

  const handleSaveNameClick = (newString: string) => {
    setNewCampaignName(newString);
    setSuccess(true);
    setIsEditingName(false);
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
  };

  const handleSaveBioClick = (newBio: string) => {
    console.log("Your change has been saved!");
    setSuccess(true);
    setNewCampaignBio(newBio); // Ensure the state update triggers re-render
    setIsEditingBio(false);
  };

  const handleEditBioClick = () => {
    setIsEditingBio(true);
  };

  const handleSaveCoverClick = (imageLink: string) => {
    console.log(defaultCoverImage);
    if (isValidUrl(imageLink)) {
      console.log("Your change has been saved!");
      setMessage("Your image url has been saved!");
      setSuccess(true);
      setNewCoverImage(imageLink); // Update the cover image state
      setIsEditingCover(false);
      setDefaultCoverImage(imageLink);
    } else {
      setCoverImageError(true);
    }
    console.log(defaultCoverImage);
  };

  const handleSavePPClick = (imageLink: string) => {
    if (isValidUrl(imageLink)) {
      console.log("Your profile picture url has been saved!");
      setMessage("Your profile picture url has been saved!");
      setSuccess(true);
      setNewPPImage(imageLink);
      setIsEditingPP(false);
      setDefaultProfileImage(imageLink);
      setPPImageError(false);
    } else {
      setPPImageError(true);
    }
  };

  const handleEditCoverClick = () => {
    setIsEditingCover(true);
  };

  const handleEditPPClick = () => {
    setIsEditingPP(true);
  };

  var isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      console.log("This is the true");
      return true;
    } catch (error) {
      console.log("This is the false");
      console.log(error);

      return false;
    }
  };

  const handleCampaignNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCampaignName(event.target.value);
    console.log(event.target.value);
  };

  const handleCampaignBioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCampaignBio(event.target.value);
  };

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCoverImage(event.target.value);
  };

  const handlePPImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPPImage(event.target.value);
  };

  const handleCreateCampaign = () => {
    console.log("Create Campaign Clicked");
    console.log("Name:", newCampaignName);
    console.log("Bio:", newCampaignBio);
    console.log("Cover Image:", defaultCoverImage);
    console.log("Profile Image:", defaultProfileImage);
    console.log("Box Image:", boxImage);
    console.log("Description:", description);
    console.log("Color:", color);

    // const testCampaignDetailPage: CampaignDetailPageProps = {
    //   campaign: campaign[0],
    //   quests: questsEmpty,
    // };
    // navigate("/quests", { state: testCampaignDetailPage });

    createCampaign(
      newCampaignName,
      newCampaignBio,
      description.part1,
      description.main,
      description.part2,
      "TEST",
      boxImage,
      defaultCoverImage,
      defaultProfileImage,
      color,
      "avail",
      "https://i.imgur.com/vVySQ4o.png"
    )
      .then((campaign) => {
        console.log("Campaign Created:", campaign);
        setReturnCampaign(campaign);
        setSuccess(true);
        setMessage("Campaign Created");
        const testCampaignDetailPage: CampaignDetailPageProps = {
          campaign,
          quests: questsEmpty,
        };
        navigate("/quests", { state: testCampaignDetailPage });
      })
      .catch((err) => {
        console.log(err);
        if (err.error_type.toString() === "Unauthorized") {
          // eslint-disable-next-line no-warning-comments
          // TODO - Re-authenticate and fix execution on re-auth (Bala)

          console.log("Unauthorized, re auth");

          setReAuthDialogOpen(true);
        } else {
          setError(true);
          setMessage(`Campaign Creation Failed: ${err.external_msg}`);
        }
      });
  };
  const handleSaveProjectImage = (newImageUrl: string) => {
    setProjectImage(newImageUrl);
  };

  const handleSaveProjectName = (newName: string) => {
    setProjectName(newName);
  };

  const handleSaveProjectTitle = (newTitle: string) => {
    setProjectTitle(newTitle);
  };

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
          ml: "5%",
          display: "flex",
          flexDirection: "column",
          width: "95%",
        }}
      >
        <mui.Box
          sx={{
            background: `url(${newCoverImage})`, // Use the updated cover image URL here
            color: campaign[0].color,
            backgroundColor: "grey",
            backgroundPosition: "center",
            height: "320px",
            backgroundSize: "cover",
          }}
        >
          <mui.Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <ProfileImage
              imageUrl={newPPImage || campaign[0].box_image}
              onEditClick={handleEditPPClick}
              onSaveClick={handleSavePPClick}
              error={ppImageError}
            />
            {/* Edit Cover Component */}
            <CoverImage
              imageUrl={newCoverImage || campaign[0].bg_image}
              onEditClick={handleEditCoverClick}
              onSaveClick={handleSaveCoverClick}
              error={coverImageError}
            />
          </mui.Box>
        </mui.Box>
        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <mui.Box sx={{ ml: "2%", mt: "5%" }}>
            {/* Project's Title Component */}
            <ProjectTitle
              title={newCampaignName}
              onEditClick={handleEditNameClick}
              onSaveClick={handleSaveNameClick}
              handleCampaignNameChange={handleCampaignNameChange}
            />

            {/* Project's Bio Component */}
            <ProjectBio
              bio={newCampaignBio}
              onEditClick={handleEditBioClick}
              onSaveClick={handleSaveBioClick}
              handleCampaignBioChange={handleCampaignBioChange}
            />
            {/* <EditableProfileAndTitle
              initialImageUrl={projectImage}
              initialTitle={projectTitle} // Separate state for project title
              onSaveImage={handleSaveProjectImage}
              onSaveTitle={handleSaveProjectTitle}
            /> */}
          </mui.Box>

          <mui.Box>
            <mui.Box
              sx={{
                backgroundColor: "#fff",
                height: "40px",
                width: "150px",
                mr: "2%",
                borderRadius: "8px",
                alignContent: "center",
                textAlign: "center",
                marginRight: "20px",
                cursor: "pointer",
              }}
              onClick={handleCreateCampaign}
            >
              <mui.Typography fontSize={"15px"} color='#000' variant='h6'>
                Create Campaign
              </mui.Typography>
            </mui.Box>
            {/* <mui.Box
							sx={{
								backgroundColor: '#fff',
								height: '40px',
								width: '150px',
								mr: '2%',
								borderRadius: '8px',
								alignContent: 'center',
								textAlign: 'center',
								marginTop: '10px',
								marginRight: '10px',
							}}
							onClick={() => {
								navigate("/create-tasks");
								console.log("INFO: Going to Create Task Screen -- Clicked");
							}}
						>
							<mui.Typography fontSize={'15px'} color="#000" variant="h6">
                Add a Quest
							</mui.Typography>
						</mui.Box> */}
          </mui.Box>
        </mui.Box>
        <mui.Divider
          sx={{ width: "100%", height: "1px", bgcolor: "#00FFAA", mt: "3%" }}
          orientation='horizontal'
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
          <CreateQuestsCard
            initialTitle={newCampaignName}
            initialSubtitle={newCampaignBio}
            initialDescription={setDescription}
            initialColor={setColor}
            initialImage={setBoxImage}
          />
          <mui.Typography
            fontSize={"10px"}
            color='#00FFAA'
            variant='h6'
            align='right'
          >
            THIS IS HOW YOUR CAMPAIGN WILL LOOK IN THE QUESTS PAGE
          </mui.Typography>
        </mui.Box>
        {/* ReAuth Dialog */}
        <ScanReAuthDialog
          isOpen={reAuthDialogOpen}
          onRequestClose={() => {
            setReAuthDialogOpen(false);
          }}
        />
      </mui.Box>
    </Layout>
  );
};

export default CreateQuests;
