import * as React from "react";
import * as mui from "@mui/material";

// components
import ArrowForward from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WhiteHueTextField from "../components/textfields/white-hue";
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
import ColorLayout from "./reusable/color-layout";

function Register() {
  const [username, setUsername] = React.useState<string | undefined>();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [language, setLanguage] = React.useState(Languages.English);
  const [length, setLength] = React.useState<Length>({
    label: "12 Words",
    value: 12,
  });

  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] =
    React.useState(true);

  /* --Biometric States--*/

  const [biometric, setBiometric] = React.useState(false);
  const [biometricAvail, setBiometricAvail] = React.useState(false);

  /* --Alert States--*/

  const [error, setError] = React.useState(false);
  const [warning, setWarning] = React.useState(false);
  const [info, setInfo] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

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

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
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
  const shouldRunEffect = React.useRef(true);
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
        if (response) {
          // Split seed phrase into array by spaces
          const seed_array = response.split(" ");

          setMessage(t("signup.messages.success"));
          setSuccess(true);
          console.log(response);

          setTimeout(() => {
            navigate("/seed", { state: { seed: seed_array } });
          }, 800);
        }
      })
      .catch((error: AvailError) => {
        setMessage(error.external_msg);
        setError(true);
      });
  }

  const md = mui.useMediaQuery("(min-width:1000px)");
  const lg = mui.useMediaQuery("(min-width:1200px)");

  return (
    <ColorLayout>
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

      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "50%",
          margin: "0 auto",
          padding: "50px",
        }}
      >
        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TitleText sx={{ color: "#FFF", textAlign: "center" }}>
            {t("signup.tagline.part1")}
          </TitleText>
          <TitleText sx={{ ml: "2.5%", color: "#00FFAA", textAlign: "center" }}>
            {" "}
            {t("signup.tagline.part2")}{" "}
          </TitleText>
        </mui.Box>

        <mui.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "auto",
            justifyContent: "space-between",
            bgcolor: "rgba(17, 17, 17, 0.8)",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
            // gap: "10px",
            // justifyContent: "center",
            // alignItems: "center",
          }}
        >
          <mui.TextField
            id="username"
            variant="filled"
            label={t("signup.username")}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(event.target.value);
            }}
            value={username}
            inputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{
              marginBottom: "10px",
              "& .MuiFilledInput-root": {
                backgroundColor: "#3a3a3a",
              },
              "& .MuiFilledInput-root:hover": {
                backgroundColor: "#4a4a4a",
              },
              "& .MuiFilledInput-underline:before": {
                borderBottomColor: "transparent",
              },
              "& .MuiFilledInput-underline:after": {
                borderBottomColor: "#00FFAA",
              },
            }}
          />

          <WhiteHueTextField
            id="password"
            label={t("signup.password")}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handlePasswordChange(event);
            }}
            value={password}
            type={passwordHidden ? "password" : ""}
            inputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#fff" } }}
            sx={{ marginBottom: "10px" }}
            InputProps={{
              endAdornment: (
                <mui.InputAdornment position="end">
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
                </mui.InputAdornment>
              ),
            }}
            error={Boolean(passwordError)}
            helperText={passwordError}
          />
          <mui.Box sx={{ width: "100%" }}>
            <WhiteHueTextField
              id="confirmPassword"
              label={t("signup.confirmPassword")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleConfirmPasswordChange(event);
              }}
              value={confirmPassword}
              color="primary"
              type={confirmPasswordHidden ? "password" : ""}
              inputProps={{ style: { color: "#fff" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{ width: "100%" }}
              InputProps={{
                endAdornment: (
                  <mui.InputAdornment position="end">
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
                  </mui.InputAdornment>
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

            <mui.Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 12,
                marginTop: "1%",
                fontWeight: 700,
                // textAlign: "center", // Center the text
                width: "100%",
              }}
            >
              Password must be at least 12 characters long, and contain at least
              a digit and a symbol.
            </mui.Typography>
          </mui.Box>
          <mui.Box>
            <SignUpButton
              onClick={() => {
                handleCreateWallet();
                // Register(username, password, biometric, navigate);
                // navigate('/home-desktop')
              }}
              sx={{ marginTop: "5%", width: "100%", bgcolor: "#7000FF" }}
              // endIcon={<ArrowForward style={{ color: "#FFF" }} />}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateWallet();
                }
              }}
            >
              <mui.Typography sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Create Account
              </mui.Typography>
            </SignUpButton>

            <mui.Box
              sx={{
                display: "flex",
                flexDirection: "row",
                marginTop: "2%",
                marginBottom: "20px",
              }}
            >
              <mui.Typography
                sx={{ color: "#a3a3a3", fontSize: 12, fontWeight: "700" }}
              >
                {" "}
                {t("signup.terms.part1")}
              </mui.Typography>

              <mui.Typography
                sx={{
                  color: "#a3a3a3",
                  fontSize: 12,
                  fontWeight: "700",
                  ml: "0.7%",
                  "&:hover": { color: "#00FFAA", cursor: "pointer" },
                }}
                onClick={() => {
                  navigate("/terms-of-service");
                }}
              >
                {" "}
                {t("signup.terms.part2")}
              </mui.Typography>
              <mui.Typography
                sx={{
                  color: "#a3a3a3",
                  fontSize: 12,
                  fontWeight: "700",
                  ml: "0.7%",
                }}
              >
                {" "}
                {t("signup.terms.part3")}
              </mui.Typography>
              <mui.Typography
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
              </mui.Typography>
            </mui.Box>
          </mui.Box>

          <mui.Box
            sx={{
              display: "flex",
              flexDirection: "row",
              marginTop: "20px",
              width: "80%",
              alignItems: "center",
              justifyContent: "center",
              gap: "50px",
              margin: "0 auto",
              marginBottom: "20px",
            }}
          >
            <mui.Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 18,
                fontWeight: "500",
                wordWrap: "break-word",
                display: "flex",
                alignItems: "center",
              }}
            >
              {t("signup.access")}
            </mui.Typography>

            <mui.Button
              sx={{
                display: "flex",
                width: "123px",
                height: "35px",
                borderRadius: 9,
                background: "#3E3E3E",
                color: "#FFFFFF",
                "&:hover": { background: "#00FFAA", color: "#000" },
              }}
              onClick={() => {
                navigate("/recovery");
              }}
            >
              <mui.Typography
                sx={{
                  fontWeight: 300,
                  fontSize: "18px",
                  wordWrap: "break-word",
                  textTransform: "none",
                }}
              >
                {t("signup.recover")}
              </mui.Typography>
            </mui.Button>
          </mui.Box>

          <mui.Box
            sx={{
              display: "flex",
              flexDirection: "row",
              marginTop: "5%",
              width: "80%",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              gap: "50px",
              // paddingX: "30px",
            }}
          >
            <mui.Typography
              sx={{
                color: "#a3a3a3",
                fontSize: 18,
                fontWeight: "500",
                alignContent: "center",
              }}
            >
              Want to import an account ?
            </mui.Typography>
            <mui.Button
              sx={{
                display: "flex",
                width: "123px",
                height: "35px",
                borderRadius: 9,
                background: "#3E3E3E",
                color: "#FFFFFF",
                "&:hover": { background: "#00FFAA", color: "#000" },
              }}
              onClick={() => {
                navigate("/import");
              }}
            >
              <mui.Typography
                sx={{
                  fontWeight: 300,
                  fontSize: "18px",
                  wordWrap: "break-word",
                  textTransform: "none",
                }}
              >
                Import
              </mui.Typography>
            </mui.Button>
          </mui.Box>
        </mui.Box>
      </mui.Box>
    </ColorLayout>
  );
}

export default Register;
