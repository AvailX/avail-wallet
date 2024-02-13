import { invoke } from "@tauri-apps/api/core";
import { NavigateFunction } from "react-router-dom";
import { AvailError } from "../../types/errors";
import { Languages } from "../../types/languages";

export function recover(phrase: string, password: string, authType: boolean, language: Languages, navigate: NavigateFunction, setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>, setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>,) {
    return (invoke<string>("recover_wallet_from_seed_phrase", { seed_phrase: phrase, password: password, access_type: authType, language: language }).then((response) => {
        setMessage("Wallet recovered successfully.");
        setSuccessAlert(true);

        setTimeout(() => {
            navigate("/home");
        }, 800);
    }
    ).catch((e) => {
        let error: AvailError = JSON.parse(e);
        console.log("Error: " + error.internal_msg);

        setMessage(error.external_msg);
        setErrorAlert(true);

    }));
}