import { Theme, createTheme } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "DM Sans",
  },
  palette: {
    primary: { main: "#00FFAA" },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
        variant: "contained",
        color: "primary",
      },
      styleOverrides: {
        root: {
          textTransform: "inherit",
        },
        contained: {
          color: "#000",
          fontWeight: 700,
          border: "1px solid #F5F5F7",
          borderRadius: "9px",
        },
        outlined: {
          boxShadow: "0px 4px 4px 0px #00FFAA40 inset",
          border: "0px",
          color: "#fff",
          "&:hover": {
            border: "none",
            boxShadow: "0px 4px 4px 0px #00FFAA40 inset",
          },
        },
      },
    },
  },
});

export default theme;
