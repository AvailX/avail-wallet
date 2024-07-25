import { useState } from "react";
import { Box, Button, Input, Typography, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthLayout from "../../layouts/AuthLayout";
import { register_seed_phrase } from "../../../src-desktop/services/authentication/register";
import { Languages } from "../../../src-desktop/types/languages";

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

  type FormData = {
    username?: string;
    password: string;
    confirmPassword: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
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
      {errors &&
        Object.keys(errors).map((field: string) => (
          <Stack key={field} my={1}>
            <Alert severity='error'>
              {errors[field as keyof FormData]?.message}
            </Alert>
          </Stack>
        ))}
      <Box display='flex' height='100vh' flexDirection='column' pt={10}>
        <Typography textAlign='left' mb={2} fontWeight={700} fontSize='25px'>
          Create your{" "}
          <span style={{ color: "#05e69a" }}>Username & Password</span>
        </Typography>
        <form onSubmit={handleSubmit(clickStuff)}>
          <Controller
            name='username'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Input
                {...field}
                placeholder='username.avl.alo'
                fullWidth
                disableUnderline
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
                  p: 2,
                }}
              />
            )}
          />

          <Controller
            name='password'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Input
                {...field}
                fullWidth
                type={passwordHidden ? "password" : "text"}
                placeholder='Password'
                error={!!errors.password}
                disableUnderline
                inputProps={{
                  sx: {
                    "&::placeholder": {
                      // color: "#676767",
                      //opacity: 1,
                    },
                    color: "#fff",
                  },
                }}
                sx={{
                  my: 2,
                  color: "#fff",
                  border: "1px solid #00FFAA",
                  borderRadius: "8px",
                  p: 2,
                }}
                endAdornment={
                  passwordHidden ? (
                    <VisibilityOffIcon
                      style={{ color: "#fff", cursor: "pointer" }}
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
                  )
                }
              />
            )}
          />
          <Controller
            name='confirmPassword'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Input
                {...field}
                type={passwordHidden ? "password" : "text"}
                placeholder='Confirm Password'
                fullWidth
                error={!!errors.confirmPassword}
                disableUnderline
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
                  p: 2,
                }}
                endAdornment={
                  passwordHidden ? (
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
                  )
                }
              />
            )}
          />

          <Button sx={{ mt: 4, mb: 2, py: 2, width: "100%" }} type='submit'>
            {isLoading ? "Loading...." : "Continue"}
          </Button>
        </form>
      </Box>
    </AuthLayout>
  );
};

export default Username;
