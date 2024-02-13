import { invoke } from "@tauri-apps/api/core";
import * as platform from 'platform';

import { NavigateFunction } from "react-router-dom";
import { AvailError } from "../../types/errors";
import { Languages } from "../../types/languages";
import { get_os_function_name } from "../util/functions";


export function register(setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>, setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, username: string | undefined, password: string, authType: boolean, language: Languages, navigate: NavigateFunction) {

  const function_to_call: string = "create_wallet";

  invoke<String>(get_os_function_name(function_to_call), { username: username, password: password, access_type: authType, backup: false, language: language })
    .then((response) => {

      if (response === "Key stored") {
        setMessage("Wallet created successfully.");
        setSuccessAlert(true);
        navigate("/home", { state: { username: username } });
      } else {
        setMessage("Problem when creating account, apologies. Please try again.");
        setErrorAlert(true);
      }
    })
    .catch((error: AvailError) => {
      //TODO - Sentry should log AvailError
      setMessage("Problem when creating account, apologies. Please try again.");
      setErrorAlert(true);
    });

}

// TODO - add backup parameter
export function register_seed_phrase(setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, username: string | undefined, password: string, authType: boolean, language: Languages) {

  console.log("Registering seed phrase wallet");

  return (invoke<string>("create_seed_phrase_wallet", { username: username, password: password, access_type: authType, backup: false, language: language }).then((response) => {
    return response;
  }).catch((error: AvailError) => {
    //TODO - Sentry should log AvailError
    setMessage("Problem when creating account, apologies. Please try again.");
    setErrorAlert(true);
    console.log(error);
  }));

}

export async function import_wallet(username: string, password: string, authType: boolean, private_key: string, language: Languages) {
  const response: string = await invoke<string>("import_wallet", { username: username, password: password, access_type: authType, private_key: private_key, backup: false, language: language });
  return response;
}

// For Mobile
export async function checkBiometrics() {
  if (platform.os?.family === "Android") {
    const permission: boolean = await invoke("device_auth_permission");

    if (permission) {
      const fingerprint: boolean = await invoke("device_auth_availability");
      return fingerprint;
    } else {
      return false;
    }
  } else {
    const response: boolean = await invoke("prepare_context");
    console.log(response);
    return response;
  }
}
