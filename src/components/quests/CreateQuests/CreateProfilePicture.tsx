import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ConfirmDialog from "../CreateQuests/ConfirmDialog";

interface PPImageProps {
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

const ProfileImage: React.FC<PPImageProps> = ({
  imageUrl,
  onEditClick,
  onSaveClick,
  error,
}) => {
  const [newUrl, setNewUrl] = React.useState(imageUrl);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEdited, setIsEdited] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const mdsx = mui.useMediaQuery("(min-width:850px)");
  const md = mui.useMediaQuery("(min-width:950px)");
  const mdlg = mui.useMediaQuery("(min-width:1150px)");
  const lgsx = mui.useMediaQuery("(min-width:1550px)");
  const lg = mui.useMediaQuery("(min-width:1750px)");
  const lgxl = mui.useMediaQuery("(min-width:1950px)");

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
    console.log("You profile image has been saved");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
  };

  return (
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
          borderRadius: "50%",
          border: "1px solid #696969",
          width: "200px",
          height: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#D3D3D3",
          position: "relative",
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
          <mui.Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <mui.Avatar
              src={imageUrl}
              alt="Profile image"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            <mui.IconButton
              sx={{
                backgroundColor: "#696969",
                p: 2,
                position: "absolute",
                top: "calc(100% - 50px)",
                left: "calc(70%)",
                display: isEdited ? "none" : "flex",
              }}
              onClick={() => {
                if (!isEdited) {
                  setIsEditing(true);
                  onEditClick();
                }
              }}
            >
              <CameraAltIcon sx={{ color: "#FFFFFF" }} />
            </mui.IconButton>
          </mui.Box>
        )}
      </mui.Box>

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

export default ProfileImage;
