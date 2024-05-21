import * as React from "react";
import * as mui from "@mui/material";
import { styled } from "@mui/system";

// Sample image URLs (these should be direct URLs to images)
const backgroundImageUrl = "https://via.placeholder.com/800x300"; // Replace with your background image URL
const profileImageUrl = "https://via.placeholder.com/150"; // Replace with your profile image URL
const verifiedBadgeUrl = "https://via.placeholder.com/40"; // Replace with your verified badge image URL

const Container = styled(mui.Box)({
  position: "relative",
  overflow: "visible",
  backgroundColor: "black",
  paddingBottom: "100px", // Add enough space to accommodate the profile image
  color: "white", // Ensure text color is white for readability
  minHeight: "100vh",
});

const TransparentBackground = styled(mui.Box)({
  position: "relative",
  height: "240px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
});

const Background = styled(mui.Box)({
  backgroundImage: `url(${backgroundImageUrl})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "150px",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
});

const ProfileContainer = styled(mui.Box)({
  position: "absolute",
  top: "100px", // Position to overlap half of the background
  left: "20%",
  transform: "translateX(-50%)",
  width: "130px",
  height: "130px",
  display: "flex",
  justifyContent: "center",
  backgroundColor: "transparent",
  zIndex: 1,
});

const ProfileImageWrapper = styled(mui.Box)({
  position: "relative",
  width: "130px",
  height: "130px",
  borderRadius: "50%",
  border: "0.6px solid #01f0a0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent", // To ensure visibility of borders
  zIndex: 1,
});

const ProfileImage = styled("img")({
  width: "88%",
  height: "88%",
  borderRadius: "50%",
});

const VerifiedBadgeWrapper = styled(mui.Box)({
  position: "absolute",
  bottom: "1px",
  right: "5px",
  width: "40px",
  height: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "50%",
  zIndex: 2,
});

const VerifiedBadge = styled("img")({
  width: "100%",
  height: "100%",
  borderRadius: "50%",
});

const ProfileText = styled(mui.Box)({
  marginLeft: "5%",
  right: "10px",
});

const Divider = styled(mui.Divider)({
  marginTop: "10px",
  mb: "10px",
  backgroundColor: "#00FFAA",
});

function Quests() {
  return (
    <Container>
      <TransparentBackground>
        <Background />
        <ProfileContainer>
          <ProfileImageWrapper>
            <ProfileImage src={profileImageUrl} alt="Profile" />
          </ProfileImageWrapper>
          <VerifiedBadgeWrapper>
            <VerifiedBadge src={verifiedBadgeUrl} alt="Verified" />
          </VerifiedBadgeWrapper>
        </ProfileContainer>
      </TransparentBackground>
      <ProfileText>
        <mui.Typography fontSize={"16px"}>Disruptors</mui.Typography>
        <mui.Typography fontSize={"13px"}>
          Welcome to the Disruptor Quests, for those who want to enact change
          and make an impact.
        </mui.Typography>
      </ProfileText>
      <Divider />
    </Container>
  );
}

export default Quests;
