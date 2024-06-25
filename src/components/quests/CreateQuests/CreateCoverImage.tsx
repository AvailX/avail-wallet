import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmDialog from "../CreateQuests/ConfirmDialog";

interface CoverImageProps {
  imageUrl: string;
  onEditClick: () => void;
  onSaveClick: (newUrl: string) => void;
  error: boolean;
}

const isValidUrl = (url: string): boolean => {
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

const CoverImage: React.FC<CoverImageProps> = ({
  imageUrl,
  onEditClick,
  onSaveClick,
  error,
}) => {
  const [newUrl, setNewUrl] = React.useState(imageUrl);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEdited, setIsEdited] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSaveClick = () => {
    if (isValidUrl(newUrl)) {
      setOpenDialog(true);
    }
  };

  const handleConfirmSave = () => {
    onSaveClick(newUrl);
    setIsEditing(false);
    setIsEdited(true);
    setOpenDialog(false);
    console.log("Your cover image has been saved");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
  };

  return (
    <mui.Box
      sx={{
        backgroundColor: "white",
        width: isEditing ? "15rem" : "10rem",
        height: isEditing ? "60px" : "50px",
        borderRadius: "10px",
        alignItems: "center",
        justifyContent: "center",
        justifyItems: "center",
        justifySelf: "center",
        alignSelf: "self-end",
        mr: "5%",
        mb: "10%",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {isEditing ? (
        <mui.Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            width: "200px",
          }}
        >
          <mui.TextField
            value={newUrl}
            onChange={handleUrlChange}
            variant="outlined"
            size="small"
            sx={{
              marginRight: "8px",
              borderRadius: "5px",
              borderColor: error ? "red" : "green",
            }}
            error={error}
            helperText={error ? "Enter valid URL" : ""}
            InputProps={{
              style: {
                borderColor: error ? "red" : "green",
              },
            }}
            FormHelperTextProps={{
              sx: {
                fontSize: "9px",
              },
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
          <mui.IconButton
            sx={{
              color: "#000000",
              textSizeAdjust: "auto",
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
          <mui.Typography fontSize={"15px"} color="#000" variant="h6">
            Change cover
          </mui.Typography>
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

export default CoverImage;
