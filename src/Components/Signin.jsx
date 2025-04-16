import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Dialog from "@mui/material/Dialog";
import Container from "@mui/material/Container";
import { loginUser } from "../apis/userFn";
import Box from "@mui/material/Box";
import { yupResolver } from "@hookform/resolvers/yup";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";
import * as yup from "yup";
import { TextField, Button, Typography } from "@mui/material";
import Signup from "./Signup";
import LinearProgress from "@mui/material/LinearProgress";

function Signin(props) {
  const { onClose, open } = props;
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [firstPage, setFirstPage] = useState(false);
  const queryClient = useQueryClient();

  const schema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),

    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries(["userData"]);
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

  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog
      maxWidth="sm"
      sx={{
        background: "rgba(38, 37, 37, 0.5)",
        borderRadius: "50px",
        "& .MuiPaper-root": {
          borderRadius: "50px!important",
          background: "rgba(38, 37, 37, 0.5)",
        },
      }}
      onClose={handleClose}
      open={open}
    >
      <Container
        sx={{
          overflow: "hidden",
          backgroundColor: "rgba(14 14 14 / 1)",
          position: "relative",
          borderRadius: "50px",
          transition: "max-height 0.3s ease",
          maxHeight: firstPage ? "700px" : "500px",
        }}
        maxWidth="sm"
      >
        <Box
          className="smoothTransition"
          sx={{
            p: 4,
            opacity: !firstPage ? "1" : "0",
            visibility: !firstPage ? "visible" : "hidden",
            borderRadius: "50px",
            textAlign: "center",
            transform: !firstPage
              ? "translateX(0%) translateY(7px)"
              : "translateX(100%) translateY(7px) translateZ(1px)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h1" color="#fff" gutterBottom>
                VTube
              </Typography>
              <Typography variant="body1" color="#fff" gutterBottom>
                Sign in to your account
              </Typography>
            </Box>

            <TextField
              variant="outlined"
              spellCheck="false"
              fullWidth
              label="Email"
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
                textTransform: "none",
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "rgba(168, 199, 250 , 1)",
                mt: 2,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgb(180, 207, 248)",
                },
              }}
            >
              {isPending ? (
                <CircularProgress
                  sx={{
                    mx: "auto",
                    textAlign: "center",
                    color: "inherit",
                  }}
                  size={30}
                />
              ) : (
                <Typography>Sign In</Typography>
              )}
            </Button>

            <Box sx={{ paddingY: 4 }}>
              <Typography variant="body1" sx={{ paddingY: 1, color: "#fff" }}>
                Don't have an account?{" "}
                <span
                  style={{
                    cursor: "pointer",
                    color: "rgba(168, 199, 250 , 1)",
                  }}
                  onClick={() => setFirstPage(true)}
                >
                  Sign Up
                </span>
              </Typography>
            </Box>
          </form>

          {isPending && (
            <LinearProgress
              sx={{
                position: "fixed",
                top: "485px",
                left: "0",
                bottom: "0",
                right: "0",
                background: "rgb(180, 207, 248)",
              }}
            />
          )}
        </Box>

        <Signup firstPage={firstPage} setFirstPage={setFirstPage} />

        <CloseOutlinedIcon
          onClick={handleClose}
          sx={{
            color: "#fff",
            position: "absolute", // ✅ Directly apply absolute positioning
            top: "24px",
            right: "24px",
            cursor: "pointer",
          }}
        />
      </Container>
    </Dialog>
  );
}

export default Signin;
