// import availLogo from "../assets/avail-icon.svg";
import AssestCard from "./AssestCard";

// Types
import { type AssetType } from "../types/assets/asset";

export type AssetProps = {
  asset: AssetType[] | undefined;
};

const AsssetDisplay: React.FC<AssetProps> = ({ asset }) => {
  // const assetData = [
  //   { image_ref: availLogo, symbol: "Avail", total: 140, value: 0.05 },
  //   { image_ref: availLogo, symbol: "Avail", total: 240, value: 0.006 },
  // ];
  return <> {asset?.map((item) => <AssestCard {...item} />)}</>;
};

export default AsssetDisplay;
