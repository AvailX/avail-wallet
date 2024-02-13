import { invoke } from "@tauri-apps/api/core";

import { TxScanResponse } from "src/types/events";
import { AvailError } from "src/types/errors";

export async function scan_messages() {
    return invoke<TxScanResponse>("txs_sync");
}