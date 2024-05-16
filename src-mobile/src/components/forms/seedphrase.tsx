import React, { useState } from "react";
import { TextField, Grid } from "@mui/material";

const WalletInput: React.FC = () => {
  const [keys, setKeys] = useState<string[]>(Array(12).fill(""));

  const handleChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={6} container justifyContent="center">
        {[...Array(6)].map((_, index) => {
          return (
            <Grid item key={index}>
              <TextField
                fullWidth
                variant="outlined"
                label={`${index + 1}.`}
                value={keys[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                style={{ marginBottom: "8px" }}
                InputProps={{
                  sx: {
                    width: "143px",
                    alignItems: "center",
                    borderRadius: "9px",
                    ml: "40px",
                    color: "gray",
                    backgroundColor: "#3E3E3E",
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: "#B3B3B3",
                    ml: "30px",
                  },
                }}
              />
            </Grid>
          );
        })}
      </Grid>
      <Grid item xs={6} container justifyContent="center">
        {[...Array(6)].map((_, index) => {
          const rowIndex = index + 6;
          return (
            <Grid item key={index}>
              <TextField
                fullWidth
                variant="outlined"
                label={`${index + 7}.`}
                value={keys[rowIndex]}
                onChange={(e) => handleChange(rowIndex, e.target.value)}
                style={{ marginBottom: "8px" }}
                InputProps={{
                  sx: {
                    width: "143px",
                    alignItems: "center",
                    borderRadius: "9px",
                    mr: "36px",
                    backgroundColor: "#3E3E3E",
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: "#B3B3B3",
                  },
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default WalletInput;