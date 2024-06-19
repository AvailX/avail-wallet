import * as React from "react";
import * as mui from "@mui/material";
import logo from "../assets/logos/avail-black-icon.svg";
import { useNavigate } from "react-router-dom";

import { session_and_local_auth } from "../../../src/services/authentication/auth";
import { AvailError, AvailErrorType } from "../../../src/types/errors";
import { ErrorAlert } from "../../../src/components/snackbars/alerts";

function EntryPoint() {
  const navigate = useNavigate();
  const [alert, setAlert] = React.useState<boolean>(false);
  const [alertMessage, setAlertMessage] = React.useState<string>("");

  React.useEffect(() => {
    setTimeout(() => {
      /* -- Local + Session Auth -- */
      session_and_local_auth(
        undefined,
        navigate,
        setAlert,
        setAlertMessage,
        true
      ).catch(async (error_) => {
        console.log(error_);

        const error = error_ as AvailError;

        if (error?.error_type === AvailErrorType.Network) {
          console.log("network error");
          // TODO - Desktop login
        }

        if (
          error?.error_type?.toString() === "Unauthorized" ||
          error?.error_type?.toString() === "Invalid Data"
        ) {
          navigate("/login");
        } else {
          navigate("/username");
        }
      });
    }, 3000);
  }, []);
  return (
    <>
      <ErrorAlert
        errorAlert={alert}
        setErrorAlert={setAlert}
        message={alertMessage}
      />
      <mui.Box
        sx={{
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
        }}
      >
        <img src={logo} style={{ width: "30%", alignSelf: "center" }} />
      </mui.Box>
    </>
  );
}

export default EntryPoint;
