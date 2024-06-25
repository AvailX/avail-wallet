import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ConfirmDialog from "../CreateQuests/ConfirmDialog";

interface EditableProfileAndTitleProps {
  initialImageUrl: string;
  initialTitle: string;
  onSaveImage: (newImageUrl: string) => void;
  onSaveTitle: (newTitle: string) => void;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const EditableProfileAndTitle: React.FC<EditableProfileAndTitleProps> = ({
  initialImageUrl,
  initialTitle,
  onSaveImage,
  onSaveTitle,
}) => {
  const [imageUrl, setImageUrl] = React.useState(initialImageUrl);
  const [title, setTitle] = React.useState(initialTitle);
  const [isEditingImage, setIsEditingImage] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [newImageUrl, setNewImageUrl] = React.useState(initialImageUrl);
  const [newTitle, setNewTitle] = React.useState(initialTitle);
  const [imageError, setImageError] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogAction, setDialogAction] = React.useState<"image" | "title">(
    "image"
  );
  const [imageEdited, setImageEdited] = React.useState(false);
  const [titleEdited, setTitleEdited] = React.useState(false);

  const handleSaveClick = () => {
    if (dialogAction === "image" && isValidUrl(newImageUrl)) {
      onSaveImage(newImageUrl);
      setImageUrl(newImageUrl);
      setIsEditingImage(false);
      setImageEdited(true);
    } else if (dialogAction === "title") {
      onSaveTitle(newTitle);
      setTitle(newTitle);
      setIsEditingTitle(false);
      setTitleEdited(true);
    }
    setOpenDialog(false);
  };

  const handleEditImageClick = () => {
    if (!imageEdited) {
      setIsEditingImage(true);
    }
  };

  const handleEditTitleClick = () => {
    if (!titleEdited) {
      setIsEditingTitle(true);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleSaveButtonClick = (action: "image" | "title") => {
    setDialogAction(action);
    setOpenDialog(true);
  };

  return (
    <mui.Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey",
        width: "300px",
        height: "100px",
        borderRadius: "13px",
        padding: "10px",
      }}
    >
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          marginRight: "10px",
        }}
      >
        <mui.Avatar
          src={imageUrl}
          sx={{
            width: 70,
            height: 70,
          }}
        />
        {isEditingImage ? (
          <>
            <mui.TextField
              value={newImageUrl}
              onChange={handleUrlChange}
              variant="outlined"
              size="small"
              error={imageError}
              helperText={imageError ? "Enter a valid URL" : ""}
              sx={{ marginBottom: "10px" }}
            />
            <mui.IconButton
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              onClick={() => handleSaveButtonClick("image")}
            >
              <SaveIcon />
            </mui.IconButton>
          </>
        ) : (
          !imageEdited && (
            <mui.IconButton
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              onClick={handleEditImageClick}
            >
              <EditIcon />
            </mui.IconButton>
          )
        )}
      </mui.Box>
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {isEditingTitle ? (
          <>
            <mui.TextField
              value={newTitle}
              onChange={handleTitleChange}
              variant="outlined"
              size="small"
              sx={{ marginBottom: "10px" }}
            />
            <mui.IconButton
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              onClick={() => handleSaveButtonClick("title")}
            >
              <SaveIcon />
            </mui.IconButton>
          </>
        ) : (
          <mui.Typography variant="h6">{title}</mui.Typography>
        )}
        {!isEditingTitle && !titleEdited && (
          <mui.IconButton
            sx={{ position: "absolute", bottom: 0, right: 0 }}
            onClick={handleEditTitleClick}
          >
            <EditIcon />
          </mui.IconButton>
        )}
      </mui.Box>
      <ConfirmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleSaveClick}
        title="Confirm Save"
        content="Are you sure you want to save this edit? This change cannot be changed later."
      />
    </mui.Box>
  );
};

export default EditableProfileAndTitle;
