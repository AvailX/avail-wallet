import { invoke } from "@tauri-apps/api/core";

export async function mobile_session_and_local_auth(
  password: string | undefined
) {
  const res = await invoke<string>("get_session", { password });
  return res;
}
