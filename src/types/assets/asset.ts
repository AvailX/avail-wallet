export type Balance = {
  private: number;
  public: number;
};

export type AssetType = {
  image_ref: string | undefined;
  symbol: string;
  balance: Balance;
  total: number;
  value: number;
};
