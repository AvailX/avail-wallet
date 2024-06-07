
import { check } from "@tauri-apps/plugin-updater";

async function update() {
  const update = await check();
  return update;
}

export default update;

