import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";
import { registerUser } from "../../apis/userFn";
import LinearProgress from "@mui/material/LinearProgress";

const Signup = (props) => {
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const { firstPage, setFirstPage } = props;

  const schema = yup.object({
    username: yup.string().required("Username is required"),
    fullName: yup.string().required("Fullname is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setTimeout(() => {
        setFirstPage(false);
        queryClient.invalidateQueries(["userData"]);
      }, 900); // Delay navigation for 500ms
    },
    onError: (error) => {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message
      );
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    mutate(data);

    console.log("User Data:", data);
  };

  return (
    <Box
      className="smoothTransition"
      sx={{
        p: 4,
        opacity: firstPage ? "1" : "0",
        visibility: firstPage ? "visible" : "hidden",
        borderRadius: "50px",
        textAlign: "center",
        transform: firstPage
          ? "translateX(0) translateY(-509px)"
          : "translateX(-100%) translateY(-509px) translateZ(1px)",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h1" color="#fff" gutterBottom>
            VTube
          </Typography>
          <Typography variant="body1" color="#fff" gutterBottom>
            Create an account
          </Typography>
        </Box>

        <TextField
          variant="outlined"
          spellCheck="false"
          fullWidth
          label="Username"
          sx={{
            backgroundColor: "rgba(14, 14, 14, 1)",
            "& .MuiInputLabel-root": {
              color: "#fff",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "rgba(168, 199, 250 , 1)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: "#ccc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(168, 199, 250 , 1)",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  "0 0 0 1000px rgba(14, 14, 14, 1) inset !important",
                WebkitTextFillColor: "#fff !important",
                caretColor: "#fff !important",
              },
            },
          }}
          margin="dense"
          autoComplete="username"
          {...register("username")}
          error={!!errors.username}
          helperText={
            <span style={{ minHeight: "20px", display: "block" }}>
              {errors.username?.message || " "}
            </span>
          }
        />
        <TextField
          variant="outlined"
          spellCheck="false"
          fullWidth
          label="Fullname"
          sx={{
            backgroundColor: "rgba(14, 14, 14, 1)",
            "& .MuiInputLabel-root": {
              color: "#fff",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "rgba(168, 199, 250 , 1)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: "#ccc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(168, 199, 250 , 1)",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  "0 0 0 1000px rgba(14, 14, 14, 1) inset !important",
                WebkitTextFillColor: "#fff !important",
                caretColor: "#fff !important",
              },
            },
          }}
          margin="dense"
          {...register("fullName")}
          error={!!errors.fullName}
          helperText={
            <span style={{ minHeight: "20px", display: "block" }}>
              {errors.fullName?.message || " "}
            </span>
          }
        />
        <TextField
          variant="outlined"
          spellCheck="false"
          fullWidth
          sx={{
            backgroundColor: "rgba(14, 14, 14, 1)",
            "& .MuiInputLabel-root": {
              color: "#fff",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "rgba(168, 199, 250 , 1)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: "#ccc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(168, 199, 250 , 1)",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  "0 0 0 1000px rgba(14, 14, 14, 1) inset !important",
                WebkitTextFillColor: "#fff !important",
                caretColor: "#fff !important",
              },
            },
          }}
          label="Email"
          margin="dense"
          autoComplete="email"
          {...register("email")}
          error={!!errors.email}
          helperText={
            <span style={{ minHeight: "20px", display: "block" }}>
              {errors.email?.message || " "}
            </span>
          }
        />
        <TextField
          variant="outlined"
          spellCheck="false"
          fullWidth
          sx={{
            backgroundColor: "rgba(14, 14, 14, 1)",
            "& .MuiInputLabel-root": {
              color: "#fff",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "rgba(168, 199, 250 , 1)",
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: "#ccc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(168, 199, 250 , 1)",
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow:
                  "0 0 0 1000px rgba(14, 14, 14, 1) inset !important",
                WebkitTextFillColor: "#fff !important",
                caretColor: "#fff !important",
              },
            },
          }}
          label="Password"
          type="password"
          autoComplete="current-password"
          margin="dense"
          {...register("password")}
          error={!!errors.password}
          helperText={
            <span style={{ minHeight: "20px", display: "block" }}>
              {errors.password?.message || " "}
            </span>
          }
        />
        {isError && <Typography color="red">{error.message}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="#fff"
          fullWidth
          sx={{
            borderRadius: "50px",
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: "rgba(168, 199, 250 , 1)",
            textTransform: "none",
            mt: 2,
            "&:hover": {
              backgroundColor: "rgb(180, 207, 248)",
            },
          }}
        >
            {isPending ? 
                       <CircularProgress
                         sx={{
                           mx: "auto",
                           textAlign: "center",
                           color: "inherit",
                         }}
                         size={30}
                       />
                      :
                         <Typography>Sign Up</Typography>
                   }
        </Button>
        <Box sx={{ paddingY: 4 }}>
          <Typography variant="body1" sx={{ paddingY: 1, color: "#fff" }}>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "rgba(168, 199, 250 , 1)" }}
              onClick={() => setFirstPage(false)}
            >
              Sign In
            </span>
          </Typography>
        </Box>
      </form>

      {isPending && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: "682px",
            left: "0",
            bottom: "0",
            right: "0",
            background: "rgb(180, 207, 248)",
          }}
        />
      )}
    </Box>
  );
};

Signup.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

export default Signup;
