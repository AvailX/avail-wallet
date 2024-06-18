import React from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const CreateQuestsBox: React.FC = () => {
  return (
    <Box
      sx={{
        border: "1px solid #D3D3D3", // Lighter grey border
        backgroundColor: "#808080", // Grey background
        color: "#FFFFFF", // White text color
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        height: "150px",
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#696969", // Darker grey on hover
        },
      }}
    >
      <Button
        startIcon={<AddIcon />}
        sx={{
          color: "#FFFFFF",
          textTransform: "none",
          "& .MuiButton-startIcon": {
            marginRight: "2px", // Space between icon and text
          },
        }}
      >
        <Typography variant="h6">Create Quest</Typography>
      </Button>
    </Box>
  );
};

export default CreateQuestsBox;
