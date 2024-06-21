// import * as React from "react";
// import * as mui from "@mui/material";
// import CameraAltIcon from "@mui/icons-material/CameraAlt";
// import EditIcon from "@mui/icons-material/Edit";

// // Components
// import Layout from "../../../views-desktop/reusable/layout";
// import SideMenu from "../../sidebar";
// import CreateQuestsBox from "../create_quests_box";

// // Types
// import {
//   type CampaignDetailPageProps,
//   campaign,
//   quests,
// } from "../../../types/quests/quest_types";

// // Typography
// import { BodyText500 } from "../../typography/typography";

// // Hooks
// import { useLocation } from "react-router-dom";

// // Alerts
// import { SuccessAlert, ErrorAlert } from "../../snackbars/alerts";

// const CreateQuests: React.FC = () => {
//   const location = useLocation();
//   const state = location.state as CampaignDetailPageProps | undefined;

//   const [newCampaignName, setNewCampaignName] = React.useState("Project Name");
//   const [isEditingName, setIsEditingName] = React.useState(false);

//   const [newCampaignBio, setNewCampaignBio] = React.useState(
//     "Tap to edit the bio of your project"
//   );
//   const [isEditingBio, setIsEditingBio] = React.useState(false);

//   const [newCoverUrl, setNewCoverUrl] = React.useState("");
//   const [isEditingCover, setIsEditingCover] = React.useState(false);
//   const [coverError, setCoverError] = React.useState(false);

//   const [error, setError] = React.useState(false);
//   const [success, setSuccess] = React.useState(false);
//   const [message, setMessage] = React.useState("");

//   const mdsx = mui.useMediaQuery("(min-width:850px)");
//   const md = mui.useMediaQuery("(min-width:950px)");
//   const mdlg = mui.useMediaQuery("(min-width:1150px)");
//   const lgsx = mui.useMediaQuery("(min-width:1550px)");
//   const lg = mui.useMediaQuery("(min-width:1750px)");
//   const lgxl = mui.useMediaQuery("(min-width:1950px)");

//   const handleCampaignNameChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setNewCampaignName(event.target.value);
//   };

//   const handleEditNameClick = () => {
//     setIsEditingName(true);
//   };

//   const handleSaveNameClick = () => {
//     setIsEditingName(false);
//     setSuccess(true);
//     setMessage("Project title has been updated!");
//     console.log("Project title has been updated!");
//   };

//   const handleCampaignBioChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setNewCampaignBio(event.target.value);
//   };

//   const handleEditBioClick = () => {
//     setIsEditingBio(true);
//   };

//   const handleSaveBioClick = () => {
//     setIsEditingBio(false);
//     setSuccess(true);
//     setMessage("Bio has been updated!");
//     console.log("Bio has been updated!");
//   };

//   const handleCoverUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setNewCoverUrl(event.target.value);
//     setCoverError(false);
//   };

//   const handleEditCoverClick = () => {
//     setIsEditingCover(true);
//   };

//   const handleSaveCoverClick = () => {
//     const urlPattern = new RegExp(
//       "^(https?:\\/\\/)?" + // protocol
//         "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
//         "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
//         "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
//         "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
//         "(\\#[-a-z\\d_]*)?$",
//       "i"
//     );
//     if (!urlPattern.test(newCoverUrl)) {
//       setCoverError(true);
//       return;
//     }

//     setIsEditingCover(false);
//     setSuccess(true);
//     setMessage("Cover URL has been updated!");
//     console.log("Cover URL has been updated!");
//   };

//   return (
//     <Layout>
//       <ErrorAlert
//         errorAlert={error}
//         setErrorAlert={setError}
//         message={message}
//       />
//       <SuccessAlert
//         successAlert={success}
//         setSuccessAlert={setSuccess}
//         message={message}
//       />
//       <SideMenu />

//       <mui.Box
//         sx={{
//           ml: md ? "5%" : "7%",
//           display: "flex",
//           flexDirection: "column",
//           width: md ? "95%" : "93%",
//         }}
//       >
//         <mui.Box
//           sx={{
//             background: `url(${campaign[0].bg_image})`,
//             color: campaign[0].color,
//             backgroundColor: "grey",
//             backgroundPosition: lgxl ? "center" : "bottom",
//             height: lgxl ? "380px" : "320px",
//             backgroundSize: "cover",
//           }}
//         >
//           <mui.Box
//             sx={{
//               display: "flex",
//               flexDirection: "row",
//               justifyContent: "space-between",
//             }}
//           >
//             {/* This is the Profile image component */}
//             <mui.Box
//               sx={{
//                 borderRadius: "100%",
//                 border: "1px solid #696969",
//                 p: 1.5,
//                 width: "200px",
//                 mt: lgxl
//                   ? "10%"
//                   : lg
//                     ? "8%"
//                     : lgsx
//                       ? "10%"
//                       : mdlg
//                         ? "10%"
//                         : md
//                           ? "13%"
//                           : mdsx
//                             ? "14%"
//                             : "17%",
//                 ml: "5%",
//               }}
//             >
//               <mui.Box
//                 sx={{
//                   borderRadius: "50%",
//                   border: "1px solid #696969",
//                   width: "200px",
//                   height: "200px",
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   backgroundColor: "#D3D3D3",
//                 }}
//               >
//                 <mui.IconButton sx={{ backgroundColor: "#696969", p: 2 }}>
//                   <CameraAltIcon sx={{ color: "#FFFFFF" }} />
//                 </mui.IconButton>
//               </mui.Box>
//             </mui.Box>
//             {/* This is the edit bg component */}
//             <mui.Box
//               sx={{
//                 backgroundColor: "white",
//                 width: "10rem",
//                 height: "50px",
//                 borderRadius: "10px",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 justifyItems: "center",
//                 justifySelf: "center",
//                 alignSelf: "self-end",
//                 mr: "5%",
//                 mb: "10%",
//                 display: "flex",
//                 flexDirection: "row",
//               }}
//             >
//               {isEditingCover ? (
//                 <mui.Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <mui.TextField
//                     value={newCoverUrl}
//                     onChange={handleCoverUrlChange}
//                     variant="outlined"
//                     size="small"
//                     sx={{
//                       marginRight: "8px",
//                       borderRadius: "5px",
//                       borderColor: coverError ? "red" : "green",
//                     }}
//                     error={coverError}
//                     helperText={coverError ? "Enter a valid URL" : ""}
//                     InputProps={{
//                       style: {
//                         borderColor: coverError ? "red" : "green",
//                       },
//                     }}
//                   />
//                   <mui.Button
//                     variant="contained"
//                     color="success"
//                     onClick={handleSaveCoverClick}
//                   >
//                     Save
//                   </mui.Button>
//                 </mui.Box>
//               ) : (
//                 <mui.Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                   onClick={handleEditCoverClick}
//                 >
//                   <mui.IconButton
//                     sx={{
//                       color: "#000000",
//                       textSizeAdjust: "auto",
//                     }}
//                   >
//                     <EditIcon />
//                   </mui.IconButton>
//                   <mui.Typography fontSize={"15px"} color="#000" variant="h6">
//                     Change cover
//                   </mui.Typography>
//                 </mui.Box>
//               )}
//             </mui.Box>
//           </mui.Box>
//         </mui.Box>
//         <mui.Box sx={{ ml: "2%", mt: "5%" }}>
//           {/* Project's Title to edit */}
//           <mui.Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               cursor: "pointer",
//             }}
//             onClick={handleEditNameClick}
//           >
//             {isEditingName ? (
//               <mui.Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <mui.TextField
//                   value={newCampaignName}
//                   onChange={handleCampaignNameChange}
//                   variant="outlined"
//                   size="small"
//                   sx={{
//                     marginRight: "8px",
//                     backgroundColor: "grey",
//                     borderRadius: "5px",
//                   }}
//                 />
//                 <mui.Button
//                   variant="contained"
//                   color="primary"
//                   onClick={handleSaveNameClick}
//                 >
//                   Save
//                 </mui.Button>
//               </mui.Box>
//             ) : (
//               <mui.Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <mui.Typography
//                   fontSize={"30px"}
//                   color="#FFF"
//                   fontWeight={"bold"}
//                 >
//                   {newCampaignName}
//                 </mui.Typography>
//                 <mui.IconButton
//                   sx={{
//                     color: "#FFF",
//                     marginRight: "8px",
//                     textSizeAdjust: "auto",
//                   }}
//                   onClick={handleEditNameClick}
//                 >
//                   <EditIcon />
//                 </mui.IconButton>
//               </mui.Box>
//             )}
//           </mui.Box>

//           {/* Projects description to edit */}
//           <mui.Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               cursor: "pointer",
//             }}
//           >
//             {isEditingBio ? (
//               <mui.Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <mui.TextField
//                   value={newCampaignBio}
//                   onChange={handleCampaignBioChange}
//                   variant="outlined"
//                   size="small"
//                   sx={{
//                     marginRight: "8px",
//                     backgroundColor: "grey",
//                     borderRadius: "5px",
//                     borderColor: "green",
//                   }}
//                   InputProps={{
//                     style: {
//                       borderColor: "green",
//                     },
//                   }}
//                 />
//                 <mui.Button
//                   variant="contained"
//                   color="success"
//                   onClick={handleSaveBioClick}
//                 >
//                   Save
//                 </mui.Button>
//               </mui.Box>
//             ) : (
//               <mui.Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <BodyText500 color="#A3A3A3" fontSize={"10px"}>
//                   {newCampaignBio}
//                 </BodyText500>
//                 <mui.IconButton
//                   sx={{
//                     color: "#FFF",
//                     marginRight: "8px",
//                     textSizeAdjust: "auto",
//                   }}
//                   onClick={handleEditBioClick}
//                 >
//                   <EditIcon />
//                 </mui.IconButton>
//               </mui.Box>
//             )}
//           </mui.Box>
//         </mui.Box>
//         <mui.Divider
//           sx={{ width: "100%", height: "1px", bgcolor: "#00FFAA", mt: "3%" }}
//           orientation="horizontal"
//         />
//         <mui.Box
//           sx={{
//             marginTop: "20px",
//             alignItems: "center",
//             mb: "5%",
//             bgcolor: "#111111",
//             alignSelf: "center",
//             width: "90%",
//             justifyContent: "space-around",
//           }}
//         >
//           <CreateQuestsBox />
//         </mui.Box>
//       </mui.Box>
//     </Layout>
//   );
// };

// export default CreateQuests;

// src/components/CreateQuests.tsx