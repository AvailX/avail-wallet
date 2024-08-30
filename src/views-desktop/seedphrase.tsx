import * as React from "react";
import * as mui from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SuccessAlert } from "../components/snackbars/alerts";
import { TitleText } from "../components/typography/typography";
import CTAButton from "../components/buttons/cta";
import Layout from "./reusable/layout";
import ColorLayout from "./reusable/color-layout";
import SeedLayout from "./reusable/seed-layout";

const SeedPhrase = () => {
  const [revealedWord, setRevealedWord] = React.useState<string | undefined>(
    undefined
  );
  const [revealAll, setRevealAll] = React.useState(false);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [warning, setWarning] = React.useState<boolean>(true);

  const { t } = useTranslation();

  const secretWords: string[] = useLocation().state.seed;

  const handleRevealToggle = () => {
    setRevealAll((previous) => !previous);
  };

  const handleCopyToClipboard = () => {
    const phrase = secretWords.join(" "); // Joins all secret words into a single string
    navigator.clipboard.writeText(phrase);
    setSuccess(true);
  };

  const navigate = useNavigate();

  const WarningAlert: React.FC = () => (
    <mui.Snackbar
      open={warning}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <div>
        <mui.Alert
          severity="warning"
          action={
            <mui.IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => {
                setWarning(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </mui.IconButton>
          }
        >
          <mui.AlertTitle>{t("seedphrase.warning.label")}</mui.AlertTitle>
          {t("seedphrase.warning.message")}
        </mui.Alert>
      </div>
    </mui.Snackbar>
  );

  return (
    <SeedLayout>
      <WarningAlert />
      <SuccessAlert
        message={t("seedphrase.copied")}
        successAlert={success}
        setSuccessAlert={setSuccess}
      />
      <mui.Box sx={{ width: "85%", alignSelf: "center" }}>
        <TitleText sx={{ color: "#FFF", textAlign: "center" }}>
          {/* {t("seedphrase.title")} */}
          Secret Recovery Phrase
        </TitleText>
        {/* <mui.Typography
          sx={{ color: "#a3a3a3", textAlign: "center", fontSize: "1.2rem" }}
        >
          {t("seedphrase.subtitle")}
        </mui.Typography> */}
      </mui.Box>
      <mui.Grid
        container
        spacing={1}
        sx={{
          marginTop: "25px",
          alignSelf: "center",
          // bgcolor: "#1E1D1D",
          borderRadius: "10px",
          width: "80%",
          padding: "50px",
          justifyContent: "center",
          mb: "1%",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Overlay with blur effect */}
        {/* {!revealAll && (
          <mui.Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)", // Dark overlay
              backdropFilter: "blur(4px)", // Blur effect
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px", // Match the parent's border radius
              zIndex: 10,
            }}
          ></mui.Box>
        )} */}

        {/* Secret words grid items */}
        {secretWords.map((word, index) => (
          <mui.Grid
            key={index}
            sx={{
              color: "#fff",
              m: "2%",
              bgcolor: "#7000FF",
              borderRadius: "10px",
              padding: "1%",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
            item
            xs={3} // Adjust the grid size as needed
          >
            <mui.Box
              sx={{
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                zIndex: 2,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {index + 1}
            </mui.Box>
            {!revealAll && (
              <mui.Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(0, 0, 0, 0.5)", // Dark overlay
                  backdropFilter: "blur(4px)", // Blur effect for individual items
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px", // Match the grid item's border radius
                  zIndex: 10, // Ensure it overlays the content within the grid item
                }}
              ></mui.Box>
            )}
            <mui.Typography
              variant="body1"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {word}
            </mui.Typography>
          </mui.Grid>
        ))}
      </mui.Grid>
      <mui.Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignSelf: "center",
          right: 0,
          mt: "10px",
          width: "40%",
        }}
      >
        <CTAButton
          text={t("seedphrase.continue")}
          onClick={() => {
            navigate("/verify", { state: { seed: secretWords } });
          }}
          width="80%"
        />
        <mui.IconButton
          onClick={handleCopyToClipboard}
          size="large"
          sx={{
            backgroundColor: "#00FFAA",
            borderRadius: "5px",
            padding: "8px",
            color: "#090909",
            "&:hover": { bgcolor: mui.alpha("#00FFAA", 0.8) },
            marginRight: "10px",
          }}
        >
          <ContentCopyIcon fontSize="inherit" />
        </mui.IconButton>

        <mui.IconButton
          onClick={handleRevealToggle}
          size="large"
          sx={{
            color: revealAll ? "white" : "white",
            "&:hover": { bgcolor: mui.alpha("#7000FF", 0.8) },
            backgroundColor: "#7000FF",
            borderRadius: "5px",
            padding: "8px",
          }}
        >
          {revealAll ? (
            <VisibilityIcon fontSize="inherit" />
          ) : (
            <VisibilityOffIcon fontSize="inherit" />
          )}
        </mui.IconButton>
      </mui.Box>
    </SeedLayout>
  );
};

export default SeedPhrase;
