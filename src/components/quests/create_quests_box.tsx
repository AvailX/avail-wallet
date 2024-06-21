import React from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const CreateQuestsBox: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        border: "1px solid #D3D3D3",
        backgroundColor: "#808080",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        height: "150px",
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#696969",
        },
      }}
      onClick={() => {
        navigate("/create-tasks");
        console.log("INFO: Going to Create Task Screen -- Clicked");
      }}
    >
      <Button
        startIcon={<AddIcon />}
        sx={{
          color: "#FFFFFF",
          textTransform: "none",
          "& .MuiButton-startIcon": {
            marginRight: "2px",
          },
        }}
      >
        <Typography variant="h6">Create Quest</Typography>
      </Button>
    </Box>
  );
};

export default CreateQuestsBox;
