import DashboardLayout from "layouts/DashboardLayout";
import QRCode from "react-qr-code";
import { get_address } from "../../../src/services/storage/persistent";
import { useEffect, useState } from "react";
import BackButton from "../../../src/components/buttons/back";

const UserQr = () => {
  const [address, setAddress] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errorAlert, setErrorAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_address()
      .then((res) => {
        console.log("This is my address", res);
        setAddress(res);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to get address.");
        setErrorAlert(true);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <BackButton />
      {loading ? (
        <p>Loading...</p>
      ) : errorAlert ? (
        <p>{message}</p>
      ) : (
        <QRCode value={address} />
      )}
    </DashboardLayout>
  );
};

export default UserQr;
