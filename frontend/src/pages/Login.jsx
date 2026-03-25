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
import ForgetModal from "../components/Modals/ForgetModal";
import { validateSignInPage } from "../utils/validate";
import { login } from "../api/userApi";
import { useDispatch } from "react-redux";
import { setUserLogged, setAdminLogged } from "../redux/reducers/userSlice";
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

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const clearFormValues = () => {
    setFormValues({ email: "", password: "" });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues(newObject);
    if (isSubmit) setFormErrors(validateSignInPage(newObject));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);
    const errorObj = validateSignInPage(formValues);
    if (Object.keys(errorObj).length > 0) {
      setFormErrors(errorObj);
      return;
    }
    try {
      const response = await login(formValues);
      if (response.status) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.userId);
        if (response.isAdmin) {
          localStorage.setItem("admin", response.isAdmin);
          dispatch(setAdminLogged());
          navigate("/dashboard");
        } else {
          dispatch(setUserLogged());
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsSubmit(false);
    clearFormValues();
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── LEFT — Form ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#FAFDF8",
          p: { xs: 3, sm: 5, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Logo mark */}
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
              fontSize: { xs: "32px", md: "40px" },
              fontWeight: 700,
              color: "#1A2F1A",
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#8A9E86",
              mb: 5,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Log in to continue your sustainable shopping journey.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                fullWidth
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

              {/* Forgot password */}
              <Box display="flex" justifyContent="flex-end" mt={-1}>
                <ForgetModal />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
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
                Log In →
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
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#3CB815",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT — Visual Panel ── */}
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
          p: 8,
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

        {/* Large ghost text */}
        <Typography
          sx={{
            position: "absolute",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "220px",
            fontWeight: 900,
            color: "rgba(255,255,255,0.025)",
            bottom: -30,
            right: -20,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          IN
        </Typography>

        {/* Central ring badge */}
        <Box
          sx={{
            position: "relative",
            width: 240,
            height: 240,
            mb: 6,
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 16,
              borderRadius: "50%",
              border: "1.5px dashed rgba(129,199,132,0.4)",
              animation: "spin 40s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 36,
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
            <SpaIcon sx={{ color: "#A5D6A7", fontSize: "36px", mb: 0.5 }} />
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "13px",
                color: "#A5D6A7",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Planet
            </Typography>
          </Box>
          {/* Orbit dots */}
          {[0, 120, 240].map((deg) => (
            <Box
              key={deg}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 8,
                height: 8,
                bgcolor: "#66BB6A",
                borderRadius: "50%",
                transform: `rotate(${deg}deg) translateX(118px) translateY(-50%)`,
                boxShadow: "0 0 8px rgba(102,187,106,0.8)",
              }}
            />
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "42px",
            fontWeight: 700,
            color: "#fff",
            mb: 2,
            textAlign: "center",
            zIndex: 2,
            lineHeight: 1.1,
          }}
        >
          Sustainable
          <br />
          <Box component="span" sx={{ color: "#A5D6A7", fontStyle: "italic" }}>
            Living
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.55)",
            maxWidth: 340,
            textAlign: "center",
            lineHeight: 1.8,
            zIndex: 2,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Access your account to manage orders, track shipments, and discover
          new eco-friendly arrivals.
        </Typography>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 5, mt: 6, zIndex: 2 }}>
          {[
            { num: "500+", label: "Products" },
            { num: "12K+", label: "Customers" },
          ].map((s) => (
            <Box key={s.label} textAlign="center">
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "26px",
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
    </Box>
  );
};

export default Login;
