import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

await onOpenUrl((urls) => {
  console.log('deep link:', urls);
});