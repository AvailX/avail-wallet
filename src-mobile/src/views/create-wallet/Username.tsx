import { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthLayout from "../../layouts/AuthLayout";
import { register_seed_phrase } from "../../../../src/services/authentication/register";
import { Languages } from "../../../../src/types/languages";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const schema = yup.object().shape({
  username: yup.string().optional(),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm Password is required"),
});

const Username = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordHidden, setPasswordHidden] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const clickStuff = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await register_seed_phrase(
        setError,
        setMessage,
        data.username,
        data.password,
        false,
        Languages.English,
        12
      );
      setIsLoading(false);
      console.log("response xxx", response);
      if (response) {
        navigate("/secret-recovery", { state: { phrase: response } });
      }
    } catch (e) {
      console.log("Error xxx", e);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box display='flex' height='100vh' flexDirection='column' pt={10}>
        <Typography textAlign='left' mb={2} fontWeight={700} fontSize='25px'>
          Select your{" "}
          <span style={{ color: "#05e69a" }}>Username & Password</span>
        </Typography>
        <form onSubmit={handleSubmit(clickStuff)}>
          <Controller
            name='username'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                placeholder='username.avl.alo'
                fullWidth
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ""}
                inputProps={{
                  sx: {
                    "&::placeholder": {
                      color: "#676767",
                      opacity: 1,
                    },
                    color: "#fff",
                  },
                }}
                sx={{
                  color: "#fff",
                  border: "1px solid #00FFAA",
                  my: 2,
                  borderRadius: "8px",
                }}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type={passwordHidden ? "password" : "text"}
                placeholder='Password'
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
                inputProps={{
                  sx: {
                    "&::placeholder": {
                      color: "#676767",
                      opacity: 1,
                    },
                    color: "#fff",
                  },
                }}
                sx={{
                  my: 2,
                  color: "#fff",
                  border: "1px solid #00FFAA",
                  borderRadius: "8px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {passwordHidden ? (
                        <VisibilityOffIcon
                          style={{ color: "#FFF", cursor: "pointer" }}
                          onClick={() => {
                            setPasswordHidden(false);
                          }}
                        />
                      ) : (
                        <VisibilityIcon
                          style={{ color: "#FFF" }}
                          onClick={() => {
                            setPasswordHidden(true);
                          }}
                        />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name='confirmPassword'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                type={passwordHidden ? "password" : "text"}
                placeholder='Confirm Password'
                fullWidth
                error={!!errors.confirmPassword}
                helperText={
                  errors.confirmPassword ? errors.confirmPassword.message : ""
                }
                inputProps={{
                  sx: {
                    "&::placeholder": {
                      color: "#676767",
                      opacity: 1,
                    },
                    color: "#fff",
                  },
                }}
                sx={{
                  my: 2,
                  color: "#fff",
                  border: "1px solid #00FFAA",
                  borderRadius: "8px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {passwordHidden ? (
                        <VisibilityOffIcon
                          sx={{ color: "white" }}
                          style={{ color: "#ff", cursor: "pointer" }}
                          onClick={() => {
                            setPasswordHidden(false);
                          }}
                        />
                      ) : (
                        <VisibilityIcon
                          style={{ color: "#fff" }}
                          onClick={() => {
                            setPasswordHidden(true);
                          }}
                        />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {error && (
            <Typography color='error' mb={2}>
              {message}
            </Typography>
          )}

          <Button sx={{ mt: 4, mb: 2, py: 2, width: "100%" }} type='submit'>
            {isLoading ? "Loading...." : "Continue"}
          </Button>
        </form>
      </Box>
    </AuthLayout>
  );
};

export default Username;
