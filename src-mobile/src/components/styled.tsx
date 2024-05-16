import { styled } from "@mui/material/styles";

export const Root = styled("div")(() => ({
  height: "100%",
}));

export const StyledBox = styled("div")(() => ({
  backgroundColor: "#1E1E1E",
}));

export const Puller = styled("div")(({}) => ({
  width: 75,
  height: 6,
  backgroundColor: "#00FFAA",
  borderRadius: 3,
  position: "absolute",
  top: 8,
  left: "calc(50% - 32.5px)",
}));
