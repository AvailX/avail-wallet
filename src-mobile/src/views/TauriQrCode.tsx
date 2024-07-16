import { scan, Format } from "@tauri-apps/plugin-barcode-scanner";
import { useEffect } from "react";

const TauriQrCode = () => {
  useEffect(() => {
    // make sure your user interface is ready to show what is underneath with a transparent element
    scan({ windowed: true, formats: [Format.QRCode] });
  }, []);
  return <div>TauriQrCode</div>;
};

export default TauriQrCode;
