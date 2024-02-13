import { Balance } from "src/services/wallet-connect/WCTypes";

export type AssetType = {
  image_ref: string | null;
  symbol: string;
  balance: Balance;
  total: number;
  value: number;
}