import * as React from "react";
import * as mui from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PaletteIcon from '@mui/icons-material/Palette';
import ConfirmDialog from "./ConfirmDialog";

interface CreateQuestsCardProps {
  initialTitle: string;
  initialSubtitle: string;
  initialDescription: {
    part1: React.SetStateAction<string>;
    main: React.SetStateAction<string>;
    part2: React.SetStateAction<string>;
  };
  initialColor: React.SetStateAction<string>;
  initialImage: React.SetStateAction<string>;
}

const CreateQuestsCard: React.FC<CreateQuestsCardProps> = ({
  initialTitle,
  initialSubtitle,
  initialDescription,
  initialColor,
  initialImage,
}) => {
  const [title, setTitle] = React.useState(initialTitle);
  const [subtitle, setSubtitle] = React.useState(initialSubtitle);
  const [description, setDescription] = React.useState<{
    part1: string;
    main: string;
    part2: string;
  }>({ part1: "Complete Weekly", main: "Quests", part2: "Win Disruptors" });
  const [color, setColor] = React.useState("#00FFAA");
  const [boxImage, setBoxImage] = React.useState("https://i.imgur.com/IzWdTWR.png");

  const [isEditing, setIsEditing] = React.useState({
    part1: false,
    main: false,
    part2: false,
    color: false,
    image: false,
  });

  const [isFieldSaved, setIsFieldSaved] = React.useState({
    part1: false,
    main: false,
    part2: false,
    color: false,
    image: false,
  });

  const [tempValues, setTempValues] = React.useState({
    part1: initialDescription.part1,
    main: initialDescription.main,
    part2: initialDescription.part2,
    color: initialColor,
    image: initialImage,
  });

  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentField, setCurrentField] = React.useState("");

  const handleEditClick = (field: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
    setCurrentField(field);
  };

  const handleConfirmSaveClick = () => {
    handleSaveClick(currentField);
    setOpenDialog(false);
  };

  const handleSaveClick = (field: string) => {
    if (field === "part1" || field === "main" || field === "part2") {
      setDescription((prev) => ({ ...prev, [field]: tempValues[field] }));
      initialDescription((prev) => ({ ...prev, [field]: tempValues[field] }));

    } else if (field === "color") {
      setColor(tempValues.color);
      initialColor(tempValues.color);

    } else if (field === "image") {
      setBoxImage(tempValues.image);
      initialImage(tempValues.image);

    }
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setIsFieldSaved((prev) => ({ ...prev, [field]: true }));
  };

  const handleSaveButtonClick = () => {
    setOpenDialog(true);
  };

  const handleChange = (field: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [field]: value }));
  };

  const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  React.useEffect(() => {
    setTitle(initialTitle);
    setSubtitle(initialSubtitle);
  }, [initialTitle, initialSubtitle]);

  return (

    <mui.Card
      sx={{
        display: "flex",
        flexDirection: "row",
        background: `linear-gradient(to right,${hexToRGBA(color, 0.5)} 10%,${hexToRGBA(color, 0.25)} 50%, #171717 70%)`,
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        width: "100%",
        borderRadius: 7,
        cursor: "pointer",
        mb: 3,
        transition:
          "transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out, bgcolor 1s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        },
      }}
    >

      <mui.Box sx={{ display: "flex", flexDirection: "column", ml: "2%" }}>
        <mui.Typography sx={{ color: "#fff", textShadow: "0 0 1px #FFF" }}>
          {title}
        </mui.Typography>
        <mui.Typography sx={{ color: "#fff" }}>{subtitle}</mui.Typography>
      </mui.Box>
      <mui.CardContent sx={{ textAlign: "center", flexDirection: "column" }}>
        <mui.Typography sx={{ color: "#A3A3A3" }}>
          {isEditing.part1 ? (
            <>
              <mui.TextField
                value={tempValues.part1}
                onChange={(e) => handleChange("part1", e.target.value)}
              />
              <mui.Button onClick={handleSaveButtonClick}>Save</mui.Button>
            </>
          ) : (
            description.part1
          )}
          {!isEditing.part1 && !isFieldSaved.part1 && (
            <mui.IconButton onClick={() => handleEditClick("part1")}>
              <EditIcon />
            </mui.IconButton>
          )}
        </mui.Typography>
        <mui.Typography sx={{ color: color, textShadow: `0 0 5px ${color}` }}>
          {isEditing.main ? (
            <>
              <mui.TextField
                value={tempValues.main}
                onChange={(e) => handleChange("main", e.target.value)}
              />
              <mui.Button onClick={handleSaveButtonClick}>Save</mui.Button>
            </>
          ) : (
            description.main
          )}
          {!isEditing.main && !isFieldSaved.main && (
            <mui.IconButton onClick={() => handleEditClick("main")}>
              <EditIcon />
            </mui.IconButton>
          )}
        </mui.Typography>
        <mui.Typography sx={{ color: "#D2D2D2" }}>
          {isEditing.part2 ? (
            <>
              <mui.TextField
                value={tempValues.part2}
                onChange={(e) => handleChange("part2", e.target.value)}
              />
              <mui.Button onClick={handleSaveButtonClick}>Save</mui.Button>
            </>
          ) : (
            description.part2
          )}
          {!isEditing.part2 && !isFieldSaved.part2 && (
            <mui.IconButton onClick={() => handleEditClick("part2")}>
              <EditIcon />
            </mui.IconButton>
          )}
        </mui.Typography>
      </mui.CardContent>
      <mui.Box sx={{ position: "relative", display: "flex" }}>
        <img style={{ width: "250px" }} src={boxImage} alt="campaign image" />
        {isEditing.image ? (
          <>
            <mui.TextField
              value={tempValues.image}
              onChange={(e) => handleChange("image", e.target.value)}
            />
            <mui.Button onClick={handleSaveButtonClick}>Save</mui.Button>
          </>
        ) : (
          !isFieldSaved.image && (
            <mui.IconButton
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              onClick={() => handleEditClick("image")}
            >
              <EditIcon />
            </mui.IconButton>
          )
        )}
      </mui.Box>
      <mui.IconButton
        sx={{ position: "absolute", top: 0, left: 0, ml: "1px" }}
        onClick={() => handleEditClick("color")}
        disabled={isFieldSaved.color}
      >
        <PaletteIcon />
      </mui.IconButton>
      {isEditing.color && (
        <mui.Dialog
          open={true}
          onClose={() => setIsEditing({ ...isEditing, color: false })}
        >
          <mui.DialogTitle>Choose a Color</mui.DialogTitle>
          <mui.DialogContent>
            <mui.TextField
              label="Hex Color"
              value={tempValues.color}
              onChange={(e) => handleChange("color", e.target.value)}
              autoFocus
            />
          </mui.DialogContent>
          <mui.DialogActions>
            <mui.Button onClick={handleSaveButtonClick}>Save</mui.Button>
          </mui.DialogActions>
        </mui.Dialog>
      )}
      <ConfirmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirmSaveClick}
        title="Confirm Save"
        content="Are you sure you want to save this edit? This change cannot be changed later."
      />
    </mui.Card>
  );
};

export default CreateQuestsCard;
