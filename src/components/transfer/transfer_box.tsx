import * as mui from "@mui/material";
import * as React from "react";

// Types
import { token, type TokenProps } from "../../types/transfer_props/tokens";

// Components
import TokenDropdown from "./token_dropdown";

// Get token list from api

const TransferBox: React.FC<TokenProps> = ({
  tokens,
  token,
  amount,
  setToken,
  setAmount,
}) => (
  <mui.Box
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: "50px",
      width: "100%",
    }}
  >
    {/* --Amount Input-- */}
    <mui.Box
      sx={{
        flex: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& input::placeholder": {
          color: "#EAEAEA",
          opacity: 0.8,
        },
      }}
    >
      <input
        type="number"
        min="0" //allows for the user to not enter less than zero for transfer
        value={amount || ""}
        autoFocus
        onChange={(e) => {
          if (Number(e.target.value) < 0) {
            setAmount(0);
          }

          setAmount(Number(e.target.value));
        }}
        placeholder="12,000.00"
        style={{
          alignSelf: "center",
          backgroundColor: "#00000000",
          //   borderRadius: "5px 5px 0px 0px",
          border: "none",
          outline: "none",
          color: "#EAEAEA", // Text color
          height: "50px",
          fontSize: "1.5rem",
          width: "100%",
        }}
      />
    </mui.Box>

    {/* --Token Dropdown-- */}
    <mui.Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TokenDropdown
        token={token}
        tokens={tokens}
        amount={amount}
        setToken={setToken}
        setAmount={setAmount}
      />
    </mui.Box>
  </mui.Box>
);

export default TransferBox;
