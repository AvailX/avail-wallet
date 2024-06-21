import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import CameraAltIcon from "@mui/icons-material/CameraAlt";

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

  const mdsx = mui.useMediaQuery("(min-width:850px)");
  const md = mui.useMediaQuery("(min-width:950px)");
  const mdlg = mui.useMediaQuery("(min-width:1150px)");
  const lgsx = mui.useMediaQuery("(min-width:1550px)");
  const lg = mui.useMediaQuery("(min-width:1750px)");
  const lgxl = mui.useMediaQuery("(min-width:1950px)");

  const handleSaveClick = () => {
    onSaveClick(newUrl);
    if (isValidUrl(newUrl)) {
      setIsEditing(false);
      console.log("This is a url");
    }
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
          <mui.Box>
            <mui.IconButton
              sx={{ backgroundColor: "#696969", p: 2 }}
              onClick={() => {
                setIsEditing(true);
                onEditClick();
              }}
            >
              <CameraAltIcon sx={{ color: "#FFFFFF" }} />
            </mui.IconButton>
          </mui.Box>
        )}
      </mui.Box>
    </mui.Box>
  );
};

export default ProfileImage;
