import React, { useState } from "react";
import {
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Button,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from "react-router-dom";
import { validateSignUpPage } from "../utils/validate";
import { signup } from "../api/userApi";
import { createAccount } from "../redux/reducers/userSlice";
import { useDispatch } from "react-redux";
import SpaIcon from "@mui/icons-material/Spa";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    bgcolor: "#F7FAF5",
    fontSize: "14px",
    "& fieldset": { borderColor: "#E4EDE2" },
    "&:hover fieldset": { borderColor: "#3CB815" },
    "&.Mui-focused fieldset": { borderColor: "#3CB815", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3CB815" },
};

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const clearFormValues = () => {
    setFormValues({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues(newObject);
    if (isSubmit) setFormErrors(validateSignUpPage(newObject));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);
    const errorObj = validateSignUpPage(formValues);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj);
      return;
    }
    try {
      const response = await signup(formValues);
      if (response.status) {
        dispatch(createAccount(formValues));
        navigate("/otp");
      }
    } catch (error) {
      console.log(error);
    }
    clearFormValues();
    setIsSubmit(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
        paddingTop: "3rem",
      }}
    >
      {/* ── LEFT — Visual Panel ── */}
      <Box
        sx={{
          flex: "0 0 44%",
          background:
            "linear-gradient(145deg, #0A3D0A 0%, #1B5E20 50%, #2E7D32 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          p: 7,
        }}
      >
        {/* Dot grid */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ghost text */}
        <Typography
          sx={{
            position: "absolute",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "200px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.025)",
            bottom: -20,
            left: -10,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          UP
        </Typography>

        {/* Leaf art ring */}
        <Box
          sx={{
            position: "relative",
            width: 220,
            height: 220,
            mb: 5,
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 14,
              borderRadius: "50%",
              border: "1.5px dashed rgba(129,199,132,0.4)",
              animation: "spin 50s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 34,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(76,175,80,0.2)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              100%
            </Typography>
            <Typography
              sx={{
                fontSize: "9px",
                color: "#A5D6A7",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                mt: 0.5,
              }}
            >
              Organic
            </Typography>
          </Box>
          {[60, 180, 300].map((deg) => (
            <Box
              key={deg}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 7,
                height: 7,
                bgcolor: "#66BB6A",
                borderRadius: "50%",
                transform: `rotate(${deg}deg) translateX(108px) translateY(-50%)`,
                boxShadow: "0 0 8px rgba(102,187,106,0.8)",
              }}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "38px",
            fontWeight: 700,
            color: "#fff",
            mb: 2,
            textAlign: "center",
            zIndex: 2,
            lineHeight: 1.1,
          }}
        >
          Join the
          <br />
          <Box component="span" sx={{ color: "#A5D6A7", fontStyle: "italic" }}>
            Movement
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            maxWidth: 300,
            textAlign: "center",
            lineHeight: 1.8,
            zIndex: 2,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Create an account and start your sustainable journey with eco-friendly
          products.
        </Typography>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 4, mt: 5, zIndex: 2 }}>
          {[
            { num: "100%", label: "Organic" },
            { num: "5K+", label: "Members" },
          ].map((s) => (
            <Box key={s.label} textAlign="center">
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {s.num}
              </Typography>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  mt: 0.5,
                }}
              >
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── RIGHT — Form ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FAFDF8",
          p: { xs: 3, sm: 5, md: 7 },
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              mb: 5,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                bgcolor: "#3CB815",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(60,184,21,0.35)",
              }}
            >
              <SpaIcon sx={{ color: "#fff", fontSize: "18px" }} />
            </Box>
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1A2F1A",
              }}
            >
              Planet
            </Typography>
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: { xs: "30px", md: "38px" },
              fontWeight: 700,
              color: "#1A2F1A",
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Create account
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#8A9E86",
              mb: 4,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Fill in your details below to get started.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2.2}>
              {/* Name row */}
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  size="small"
                  name="firstName"
                  label="First Name"
                  fullWidth
                  size="small"
                  name="firstName"
                  label="First Name"
                  value={formValues.firstName}
                  onChange={handleChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  sx={inputSx}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  sx={inputSx}
                />
                <TextField
                  fullWidth
                  size="small"
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  size="small"
                  name="lastName"
                  label="Last Name"
                  value={formValues.lastName}
                  onChange={handleChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  sx={inputSx}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  sx={inputSx}
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                name="email"
                label="Email Address"
                value={formValues.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={inputSx}
              />

              <TextField
                fullWidth
                size="small"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formValues.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff
                            sx={{ fontSize: "18px", color: "#aaa" }}
                          />
                        ) : (
                          <Visibility
                            sx={{ fontSize: "18px", color: "#aaa" }}
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                fullWidth
                size="small"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formValues.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff
                            sx={{ fontSize: "18px", color: "#aaa" }}
                          />
                        ) : (
                          <Visibility
                            sx={{ fontSize: "18px", color: "#aaa" }}
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 0.5,
                  py: 1.6,
                  borderRadius: "14px",
                  bgcolor: "#3CB815",
                  fontSize: "15px",
                  fontWeight: 700,
                  textTransform: "none",
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.02em",
                  boxShadow: "0 6px 20px rgba(60,184,21,0.3)",
                  transition: "all 0.25s",
                  "&:hover": {
                    bgcolor: "#33a313",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 28px rgba(60,184,21,0.38)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                Create Account →
              </Button>
            </Box>
          </form>

          <Box mt={4} textAlign="center">
            <Typography
              sx={{
                fontSize: "13px",
                color: "#9A9A9A",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#3CB815",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Log In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SignUp;
