// src/components/CreateQuests/ProjectTitle.tsx
import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmDialog from "../CreateQuests/ConfirmDialog";

interface ProjectTitleProps {
  title: string;
  onEditClick: () => void;
  onSaveClick: (newTitle: string) => void;
  handleCampaignNameChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

const ProjectTitle: React.FC<ProjectTitleProps> = ({
  title,
  onEditClick,
  onSaveClick,
  handleCampaignNameChange,
}) => {
  const [newTitle, setNewTitle] = React.useState(title);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEdited, setIsEdited] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSaveClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmSave = () => {
    onSaveClick(newTitle);
    setIsEditing(false);
    setIsEdited(true);
    setOpenDialog(false);
    console.log("Your Project Title has been saved");
  };

  React.useEffect(() => {
    // Update local state when `title` prop changes
    setNewTitle(title);
  }, [title]);
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
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
            }}
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
          <mui.Typography fontSize={"30px"} color="#FFF" fontWeight={"bold"}>
            {title}
          </mui.Typography>
          <mui.IconButton
            sx={{
              color: "#FFF",
              marginRight: "8px",
              textSizeAdjust: "auto",
              display: isEdited ? "none" : "flex",
            }}
            onClick={() => {
              if (!isEdited) {
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

export default ProjectTitle;
