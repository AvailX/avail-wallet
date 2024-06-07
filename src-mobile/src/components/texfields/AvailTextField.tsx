import * as React from "react";
import * as mui from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface PasswordTextFieldProps {
  isPassword: boolean;
}

function AvailTextField({ isPassword }: PasswordTextFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <mui.Box
      width={"390px"}
      height={"130px"}
      sx={{
        flexDirection: "column",
        alignItems: "center",
        position: "relative", // Needed for absolute positioning of the icon
      }}
    >
      {/* The Text Field */}
      <mui.TextField
        fullWidth
        variant="filled"
        label={
          isPassword ? (
            "Private Key"
          ) : (
            <>
              username{""}
              <span style={{ fontWeight: "bold", color: "#FFFFFF" }}>
                .avl.alo
              </span>
            </>
          )
        }
        id="outlined-basic"
        color="primary"
        sx={{
          padding: "10px 10px",
        }}
        InputProps={{
          sx: {
            alignItems: "center",
            borderRadius: "10px",
            color: "lightgray",
            padding: "5px",
            border: "2px solid #01f0a0", // Set border for both states
          },
          type: isPassword && showPassword ? "text" : "password", // Toggle password visibility if isPassword is true
        }}
        InputLabelProps={{
          sx: {
            fontSize: "2rem",
            color: "#9d9d9d",
            justifyContent: "center",
            padding: isPassword ? "5px 100px" : "1px 60px",
          },
        }}
      />

      {/* Optional Eye Icon */}
      {isPassword && (
        <mui.IconButton
          style={{
            position: "absolute",
            bottom: 0,
            right: 10,
            backgroundColor: "#01f0a0", // Set background color
            borderRadius: "50%",
            width: "40px",
            height: "40px",
          }}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <VisibilityOffIcon sx={{ color: "black" }} />
          ) : (
            <VisibilityIcon sx={{ color: "black" }} />
          )}
        </mui.IconButton>
      )}
    </mui.Box>
  );
}

export default AvailTextField;