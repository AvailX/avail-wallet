//notifications
import { NotificationProps } from "../../types/notification";


//username
import { getUsername } from "../storage/persistent";
import { get_address } from "../storage/persistent";

//auth
import { getAuthType } from "../storage/persistent";

//balance
import { get_balance,get_total_balance } from "../tokens/get_balance";
import { GetBalancesRequest } from "../wallet-connect/WCTypes";

{/* --Get Username-- */}
export const getName = async (setUsername: React.Dispatch<React.SetStateAction<string>>) => {
    const username = await getUsername();
    if (username == "#0"){
        setUsername("Add Username");
        return;
    }
    setUsername(username);
}

{/* --Get Address-- */}
export const getAddress = async (setAddress: React.Dispatch<React.SetStateAction<string>>) => {
    const address = await get_address();
    setAddress(address);
}

{/* --Get Initial-- */}
export const getInitial = async (setInitial: React.Dispatch<React.SetStateAction<string | undefined>>) => {
    const username = await getUsername();

    if (username == "#0"){
        setInitial("A");
        return;
    }

    const initial = username?.charAt(0).toUpperCase();
    setInitial(initial);
}

{/* --Get Authentication Type-- */}
export const getAuth = async (setBiometric:  React.Dispatch<React.SetStateAction<string>>) => {
    const auth = await getAuthType();
    setBiometric(auth);
}

{/* --Get Wallet Balance-- */}
export const getTokenBalance = async (asset_id:string) => {
    console.log("ASSSSSE ID ", asset_id);
    const request: GetBalancesRequest = {
        assetId: asset_id
    }
    console.log("Params passsed in FE", request);
    const bal = await get_balance(request);
    return bal;
}

//TODO - get total wallet balance for all tokens
export const getTotalBalance = async () => {

    const bal = await get_total_balance();

    return bal;
}
