// Services
import { TextField } from "@mui/material";

// components
import ArrowForward from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SignUpButton from "../components/buttons/sign-up-button";
import LanguageSelector from "../components/select/language";
import SeedLengthSelector, {
  type Length,
} from "../components/select/seed_length";

// Typography
import {
  TitleText,
  SmallText,
  BodyText,
} from "../components/typography/typography";

// Alerts
import {
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  SuccessAlert,
} from "../components/snackbars/alerts";

// Images
import full_logo from "../assets/logo/desktop-full-logo.svg";
import loginimage from "../assets/images/backgrounds/sign-up-bg.jpeg";

// Icons

// Types
import { type AvailError } from "../types/errors";
import { Languages } from "../types/languages";
import { delete_key } from "../services/keychain/keychain";
import {
  register,
  checkBiometrics,
  register_seed_phrase,
} from "../services/authentication/register";
import Layout from "./reusable/layout";
import { useState, ChangeEvent, useRef } from "react";
import {
  useMediaQuery,
  Box,
  Grid,
  InputAdornment,
  Typography,
  Button,
} from "@mui/material";

import bgImg from "../assets/images/backgrounds/avail-gradients.png";

function Register() {
  const [username, setUsername] = useState<string | undefined>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [language, setLanguage] = useState(Languages.English);
  const [length, setLength] = useState<Length>({
    label: "12 Words",
    value: 12,
  });

  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);

  {
    /* --Biometric States--*/
  }
  const [biometric, setBiometric] = useState(false);
  const [biometricAvail, setBiometricAvail] = useState(false);

  {
    /* --Alert States--*/
  }
  const [error, setError] = useState(false);
  const [warning, setWarning] = useState(false);
  const [info, setInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  function validatePassword(password: string): string {
    if (password.length < 12) {
      return t("signup.messages.errors.passwordLength");
    }

    if (!/[A-Z]/.test(password)) {
      return t("signup.messages.errors.passwordCapital");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return t("signup.messages.errors.passwordSpecial");
    }

    return "";
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);

    // You might also want to check if the passwords match here, or do it separately.
    if (newConfirmPassword === password) {
      setConfirmPasswordError(validatePassword(newConfirmPassword));
    } else {
      setConfirmPasswordError(t("signup.messages.errors.passwordMismatch"));
    }
  };

  // Check if biometrics work with mac
  const shouldRunEffect = useRef(true);
  function handleCreateWallet() {
    if (password != confirmPassword) {
      setMessage(t("signup.messages.errors.password1"));
      setError(true);
      return;
    }

    // If username not unique

    if (password.length < 12) {
      setMessage(t("signup.messages.errors.password2"));
      setError(true);
      return;
    }

    setIsLoading(true);
    register_seed_phrase(
      setError,
      setMessage,
      username,
      password,
      biometric,
      language,
      length.value
    )
      .then((response) => {
        console.log("Response on seed", response);
        if (response) {
          // Split seed phrase into array by spaces
          const seed_array = response.split(" ");

          setIsLoading(false);
          setMessage(t("signup.messages.success"));
          setSuccess(true);

          setTimeout(() => {
            navigate("/seed", { state: { seed: seed_array } });
          }, 800);
        }
      })
      .catch((error: AvailError) => {
        setIsLoading(false);
        console.log("Error on seed", error);
        setMessage(error.external_msg);
        setError(true);
      });
  }

  const md = useMediaQuery("(min-width:1000px)");
  const lg = useMediaQuery("(min-width:1200px)");

  return (
    <Layout>
      {/* --Alerts-- */}
      <ErrorAlert
        errorAlert={error}
        message={message}
        setErrorAlert={setError}
      />
      <WarningAlert
        warningAlert={warning}
        message={message}
        setWarningAlert={setWarning}
      />
      <InfoAlert infoAlert={info} message={message} setInfoAlert={setInfo} />
      <SuccessAlert
        successAlert={success}
        message={message}
        setSuccessAlert={setSuccess}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "red",
          minHeight: "100vh",
          background: `url(${bgImg})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <Grid
          sx={{
            marginTop: lg ? "4%" : md ? "2%" : "2%",
            p: 3,
            width: { md: "40%", xs: "80%" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              position: "absolute",
              top: "40px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <TitleText sx={{ color: "#FFF", mt: 2 }}>
              {t("signup.tagline.part1")}
            </TitleText>

            {/* <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <LanguageSelector
                  language={language}
                  setLanguage={setLanguage}
                  sx={{ alignSelf: 'flex-end', mr: '5%' }}
                />
              </Box>
            </Box> */}
          </Box>

          <TextField
            id="username"
            // label={t("signup.username")}
            label="Username(Optional)."
            variant="standard"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setUsername(event.target.value);
            }}
            value={username}
            inputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{
              width: "100%",
              marginTop: md ? "6%" : "3%",
            }}
          />

          <TextField
            id="password"
            label={t("signup.password")}
            variant="standard"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handlePasswordChange(event);
            }}
            value={password}
            type={passwordHidden ? "password" : ""}
            inputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{
              width: "100%",
              marginTop: md ? "6%" : "3%",
            }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {passwordHidden ? (
                    <VisibilityOffIcon
                      style={{ color: "#FFF", cursor: "pointer" }}
                      onClick={() => {
                        setPasswordHidden(false);
                      }}
                    />
                  ) : (
                    <VisibilityIcon
                      style={{ color: "#FFF" }}
                      onClick={() => {
                        setPasswordHidden(true);
                      }}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            error={Boolean(passwordError)}
            helperText={passwordError}
          />
          <Typography
            sx={{
              color: "#a3a3a3",
              fontSize: 12,
              marginTop: "1%",
              fontWeight: "400",
              alignContent: "end",
            }}
          >
            Minimum of 12 Characters & Include a digit and symbol.
          </Typography>

          <TextField
            id="confirmPassword"
            label={t("signup.confirmPassword")}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleConfirmPasswordChange(event);
            }}
            value={confirmPassword}
            color="primary"
            type={confirmPasswordHidden ? "password" : ""}
            inputProps={{ style: { color: "#fff" } }}
            variant="standard"
            InputLabelProps={{ style: { color: "#fff" } }}
            fullWidth
            sx={{
              width: "100%",
              marginTop: md ? "6%" : "3%",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {confirmPasswordHidden ? (
                    <VisibilityOffIcon
                      style={{ color: "#FFF", cursor: "pointer" }}
                      onClick={() => {
                        setConfirmPasswordHidden(false);
                      }}
                    />
                  ) : (
                    <VisibilityIcon
                      style={{ color: "#FFF" }}
                      onClick={() => {
                        setConfirmPasswordHidden(true);
                      }}
                    />
                  )}
                </InputAdornment>
              ),
            }}
            error={Boolean(confirmPasswordError)}
            helperText={confirmPasswordError}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateWallet();
              }
            }}
          />

          <SignUpButton
            disabled={!!isLoading}
            onClick={() => {
              handleCreateWallet();
            }}
            sx={{ marginTop: "5%" }}
            //endIcon={<ArrowForward style={{ color: '#FFF' }} />}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateWallet();
              }
            }}
          >
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 400 }}>
              {isLoading ? "Loading..." : t("signup.CTAButton")}
            </Typography>
          </SignUpButton>
          <Box sx={{ display: "flex", flexDirection: "row", marginTop: "3%" }}>
            <Typography
              sx={{ color: "#a3a3a3", fontSize: 12, fontWeight: "400" }}
            >
              {" "}
              {t("signup.terms.part1")}
            </Typography>
            <Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 12,
                fontWeight: "400",
                ml: "0.7%",
                "&:hover": { color: "#00FFAA", cursor: "pointer" },
              }}
              onClick={() => {
                navigate("/terms-of-service");
              }}
            >
              {" "}
              {t("signup.terms.part2")}
            </Typography>
            <Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 12,
                fontWeight: "400",
                ml: "0.7%",
              }}
            >
              {" "}
              {t("signup.terms.part3")}
            </Typography>
            <Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 12,
                fontWeight: "700",
                ml: "0.7%",
                "&:hover": { color: "#00FFAA", cursor: "pointer" },
              }}
              onClick={() => {
                navigate("/privacy-policy");
              }}
            >
              {t("signup.terms.part4")}
            </Typography>
          </Box>

          <Box
            mt={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography color="#A3A3A3" fontWeight={400} fontSize="18px">
              Already have an Aleo account?
            </Typography>
            <Box display="flex" alignItems="center">
              <Button
                onClick={() => {
                  navigate("/import");
                }}
                sx={{ mr: 2, textDecoration: "underline" }}
              >
                Import
              </Button>
              <Button
                onClick={() => {
                  navigate("/recovery");
                }}
                sx={{ textDecoration: "underline" }}
              >
                Recover
              </Button>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Register;
