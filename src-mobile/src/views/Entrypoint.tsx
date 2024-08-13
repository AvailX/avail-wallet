import * as React from "react";
import * as mui from "@mui/material";
import logo from "../assets/logos/avail-black-icon.svg";
import { Link, useNavigate } from "react-router-dom";

import { session_and_local_auth } from "../../../src/services/authentication/auth";
import { AvailError, AvailErrorType } from "../../../src/types/errors";
import { ErrorAlert } from "../../../src/components/snackbars/alerts";

const boxStyles: mui.SxProps = {
  display: "flex",
  alignItems: "center",
  alignContent: "center",
  height: "100vh",
  justifyContent: "center",
  bgcolor: "#00FFAA",
  width: "100vw",
  overflow: "hidden",
  m: 0,
  p: 0,
};

function EntryPoint() {
  const navigate = useNavigate();
  const [alert, setAlert] = React.useState<boolean>(false);
  const [alertMessage, setAlertMessage] = React.useState<string>("");

  React.useEffect(() => {
    const authenticateUser = async () => {
      try {
        const res = await session_and_local_auth(
          undefined,
          navigate,
          setAlert,
          setAlertMessage,
          true
        );
        if (res) {
          navigate("/login");
        }
      } catch (error_) {
        const error = error_ as AvailError;

        switch (error?.error_type) {
          case AvailErrorType.Network:
            console.log("network error");
            // TODO - Desktop login
            break;
          case AvailErrorType.Unauthorized:
          case AvailErrorType.InvalidData:
            navigate("/login");
            break;
          default:
            navigate("/username");
        }
      }
    };

    const timer = setTimeout(() => {
      authenticateUser();
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <ErrorAlert
        errorAlert={alert}
        setErrorAlert={setAlert}
        message={alertMessage}
      />
      <mui.Box component={Link} to="/dashboard" sx={boxStyles}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: "30%", alignSelf: "center" }}
        />
      </mui.Box>
    </>
  );
}

export default EntryPoint;
