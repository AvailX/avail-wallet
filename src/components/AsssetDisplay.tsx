import availLogo from "../assets/avail-icon.svg";
import AssestCard from "./AssestCard";

const AsssetDisplay = () => {
  const assetData = [
    { image_ref: availLogo, symbol: "Avail", total: 140, value: 0.05 },
    { image_ref: availLogo, symbol: "Avail", total: 240, value: 0.006 },
  ];
  return (
    <>
      {" "}
      {assetData.map((item) => (
        <AssestCard {...item} />
      ))}
    </>
  );
};

export default AsssetDisplay;
