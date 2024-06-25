// src/components/CreateQuests/ProjectBio.tsx
import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { BodyText500 } from "../../../components/typography/typography";
import ConfirmDialog from "../CreateQuests/ConfirmDialog";

interface ProjectBioProps {
  bio: string;
  onEditClick: () => void;
  onSaveClick: (newBio: string) => void;
  handleCampaignBioChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectBio: React.FC<ProjectBioProps> = ({
  bio,
  onEditClick,
  onSaveClick,
}) => {
  const [newBio, setNewBio] = React.useState(bio);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEdited, setIsEdited] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSaveClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmSave = () => {
    onSaveClick(newBio);
    setIsEditing(false);
    setIsEdited(true);
    setOpenDialog(false);
    console.log("You profile bio has been saved");
  };

  return (
    <mui.Box
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {isEditing ? (
        <mui.Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <mui.TextField
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              marginRight: "8px",
              backgroundColor: "grey",
              borderRadius: "5px",
            }}
            onKeyDown={(e) => {
              console.log(e.key);
              if (e.key === "Enter") {
                handleSaveClick();
              }
            }}
          />
          <mui.Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
          >
            Save
          </mui.Button>
        </mui.Box>
      ) : (
        <mui.Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <BodyText500 color="#A3A3A3" fontSize={"10px"}>
            {bio}
          </BodyText500>
          <mui.IconButton
            sx={{
              color: "#FFF",
              marginRight: "8px",
              textSizeAdjust: "auto",
              display: isEdited ? "none" : "flex",
            }}
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
                onEditClick();
              }
            }}
          >
            <EditIcon />
          </mui.IconButton>
        </mui.Box>
      )}

      <ConfirmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Save"
        content="Are you sure you want to save this edit? This change cannot be changed later."
      />
    </mui.Box>
  );
};

export default ProjectBio;
