import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const Signup = (props) => {
  const { onClose, open } = props;

  const schema = yup.object({
    username: yup.string().required("Username is required"),
    fullName: yup.string().required("Fullname is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
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
          // Correct class selector
          borderRadius: "50px!important",
          background: "rgba(38, 37, 37, 0.5)", // Background applied to Dialog content
        },
      }}
      onClose={handleClose}
      open={open}
    >
      <Container
        sx={{
          backgroundColor: "rgba(14 14 14 / 1)",
          position: "relative",
          borderRadius: "50px",
        }}
        maxWidth="sm"
      >
        <Box
          sx={{
            mt: 5,
            p: 4,
            borderRadius: "50px",
            textAlign: "center",
          }}
        >
          <Typography variant="h1" color="#fff" gutterBottom>
            VTube
          </Typography>
          <Typography variant="body1" color="#fff" gutterBottom>
            Create an account
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              variant="outlined"
              fullWidth
              label="Username"
              sx={{
                backgroundColor: "rgba(14, 14, 14, 1)",
                "& .MuiInputLabel-root": {
                  // Default label color
                  color: "#fff",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  // Label color when focused
                  color: "rgba(168, 199, 250 , 1)",
                },
                "& .MuiInputBase-input": {
                  // Input text color
                  color: "#fff",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    // Default border
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    // Border on hover
                    borderColor: "#ccc",
                  },
                  "&.Mui-focused fieldset": {
                    // Border on focus
                    borderColor: "rgba(168, 199, 250 , 1)",
                  },
                },
              }}
              margin="normal"
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              variant="outlined"
              fullWidth
              label="Fullname"
              sx={{
                backgroundColor: "rgba(14, 14, 14, 1)",
                "& .MuiInputLabel-root": {
                  // Default label color
                  color: "#fff",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  // Label color when focused
                  color: "rgba(168, 199, 250 , 1)",
                },
                "& .MuiInputBase-input": {
                  // Input text color
                  color: "#fff",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    // Default border
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    // Border on hover
                    borderColor: "#ccc",
                  },
                  "&.Mui-focused fieldset": {
                    // Border on focus
                    borderColor: "rgba(168, 199, 250 , 1)",
                  },
                },
              }}
              margin="normal"
              {...register("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
            <TextField
              variant="outlined"
              fullWidth
              sx={{
                backgroundColor: "rgba(14, 14, 14, 1)",
                "& .MuiInputLabel-root": {
                  // Default label color
                  color: "#fff",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  // Label color when focused
                  color: "rgba(168, 199, 250 , 1)",
                },
                "& .MuiInputBase-input": {
                  // Input text color
                  color: "#fff",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    // Default border
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    // Border on hover
                    borderColor: "#ccc",
                  },
                  "&.Mui-focused fieldset": {
                    // Border on focus
                    borderColor: "rgba(168, 199, 250 , 1)",
                  },
                },
              }}
              label="Email"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              variant="outlined"
              fullWidth
              sx={{
                backgroundColor: "rgba(14, 14, 14, 1)",
                "& .MuiInputLabel-root": {
                  // Default label color
                  color: "#fff",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  // Label color when focused
                  color: "rgba(168, 199, 250 , 1)",
                },
                "& .MuiInputBase-input": {
                  // Input text color
                  color: "#fff",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    // Default border
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    // Border on hover
                    borderColor: "#ccc",
                  },
                  "&.Mui-focused fieldset": {
                    // Border on focus
                    borderColor: "rgba(168, 199, 250 , 1)",
                  },
                },
              }}
              label="Password"
              type="password"
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="#fff"
              fullWidth
              sx={{
                borderRadius: "50px",
                backgroundColor: "rgba(168, 199, 250 , 1)",
                mt: 2,
                "&:hover": {
                  backgroundColor: "rgb(180, 207, 248)",
                },
              }}
            >
              Sign Up
            </Button>
          </form>
        </Box>
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
};

Signup.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

export default Signup;
