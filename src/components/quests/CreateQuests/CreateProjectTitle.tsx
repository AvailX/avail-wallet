// src/components/CreateQuests/ProjectTitle.tsx
import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

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

  const handleSaveClick = () => {
    onSaveClick(newTitle);
    setIsEditing(false);
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
            }}
            onClick={() => {
              setIsEditing(true);
              onEditClick();
            }}
          >
            <EditIcon />
          </mui.IconButton>
        </mui.Box>
      )}
    </mui.Box>
  );
};

export default ProjectTitle;
