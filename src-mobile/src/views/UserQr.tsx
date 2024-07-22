import DashboardLayout from "layouts/DashboardLayout";
import QRCode from "react-qr-code";
import { get_address } from "../../../src/services/storage/persistent";
import { useEffect, useState } from "react";
import BackButton from "../../../src/components/buttons/back";

const UserQr = () => {
  const [address, setAddress] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errorAlert, setErrorAlert] = useState(false);

  get_address()
    .then((res) => {
      console.log("This is my address", res);
      setAddress(res);
    })
    .catch((error) => {
      console.log(error);
      setMessage("Failed to get address.");
      setErrorAlert(true);
    });

  useEffect(() => {
    get_address();
  }, []);

  return (
    <DashboardLayout>
      <QRCode value={address} />
    </DashboardLayout>
  );
};

export default UserQr;
