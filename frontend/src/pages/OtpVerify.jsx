import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateOtp } from '../utils/validate';
import { otpVerify, signup } from '../api/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { setUserLogged } from '../redux/reducers/userSlice';
import { Typography, Box, Button, TextField } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#F7FAF5',
    fontSize: '14px',
    '& fieldset': { borderColor: '#E4EDE2' },
    '&:hover fieldset': { borderColor: '#3CB815' },
    '&.Mui-focused fieldset': { borderColor: '#3CB815', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3CB815' },
};

const TIMER_START = 120;

const OtpVerify = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [seconds, setSeconds] = useState(TIMER_START);
  const [formValues, setFormValues] = useState({ number: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const userObj = useSelector((state) => state.user.userObj);
  const emailRex = useSelector((state) => state.user.userObj.email);

  // ── Countdown timer ──
  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newObject = { ...formValues, [name]: value };
    setFormValues(newObject);
    if (isSubmit) setFormErrors(validateOtp(newObject));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);
    const errorObj = validateOtp(formValues);
    if (Object.keys(errorObj).length > 0) { setFormErrors(errorObj); return; }
    try {
      const response = await otpVerify({ otp: formValues.number, email: emailRex });
      if (response.status && response.token) {
        localStorage.setItem('token', response.token);
        dispatch(setUserLogged());
        navigate('/');
      }
    } catch (error) { console.log(error); }
    setIsSubmit(false);
  };

  const resendOtp = async () => {
    try {
      const response = await signup({
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        password: userObj.password,
        confirmPassword: userObj.password,
      });
      if (response.status === true) {
        setSeconds(TIMER_START);
      }
    } catch (error) { console.log(error); }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}>

      {/* ── LEFT — Form ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FAFDF8',
          p: { xs: 3, sm: 5, md: 8 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', mb: 5 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#3CB815', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(60,184,21,0.35)' }}>
              <SpaIcon sx={{ color: '#fff', fontSize: '18px' }} />
            </Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 700, color: '#1A2F1A' }}>
              Planet
            </Typography>
          </Box>

          {/* Heading */}
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: '32px', md: '40px' }, fontWeight: 700, color: '#1A2F1A', lineHeight: 1.1, mb: 1 }}>
            Verify your email
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#8A9E86', mb: 1, fontFamily: "'Lato', sans-serif" }}>
            We've sent a 6-digit code to
          </Typography>

          {/* Email pill */}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#E8F5E9', px: 2, py: 0.8, borderRadius: '50px', mb: 4 }}>
            <EmailOutlinedIcon sx={{ fontSize: '14px', color: '#3CB815' }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32', fontFamily: "'Lato', sans-serif" }}>
              {emailRex || 'your email'}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2.5}>

              <TextField
                fullWidth
                name="number"
                label="Enter OTP"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                value={formValues.number}
                onChange={handleChange}
                error={!!formErrors.number}
                helperText={formErrors.number}
                sx={{
                  ...inputSx,
                  '& input': {
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    color: '#1A2F1A',
                  },
                  // Hide number spinners
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                  '& input[type=number]': { MozAppearance: 'textfield' },
                }}
              />

              {/* Timer + Resend row */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box
                    sx={{
                      px: 1.5, py: 0.5, borderRadius: '8px',
                      bgcolor: seconds > 0 ? '#FFF3E0' : '#FEE2E2',
                      border: `1px solid ${seconds > 0 ? '#FFE0B2' : '#FECACA'}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        color: seconds > 0 ? '#E65100' : '#DC2626',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {seconds > 0 ? `${mm}:${ss}` : 'Expired'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#BBBBBB', fontFamily: "'Lato', sans-serif" }}>
                    {seconds > 0 ? 'remaining' : ''}
                  </Typography>
                </Box>

                <Box
                  onClick={seconds === 0 ? resendOtp : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    cursor: seconds === 0 ? 'pointer' : 'not-allowed',
                    opacity: seconds === 0 ? 1 : 0.4,
                    color: '#3CB815',
                    transition: 'opacity 0.2s',
                    '&:hover': seconds === 0 ? { opacity: 0.75 } : {},
                  }}
                >
                  <RefreshIcon sx={{ fontSize: '15px' }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}>
                    Resend OTP
                  </Typography>
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 0.5,
                  py: 1.6,
                  borderRadius: '14px',
                  bgcolor: '#3CB815',
                  fontSize: '15px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: '0.02em',
                  boxShadow: '0 6px 20px rgba(60,184,21,0.3)',
                  transition: 'all 0.25s',
                  '&:hover': { bgcolor: '#33a313', transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(60,184,21,0.38)' },
                  '&:active': { transform: 'translateY(0)' },
                }}
              >
                Verify & Continue →
              </Button>
            </Box>
          </form>

          <Box mt={4} textAlign="center">
            <Typography sx={{ fontSize: '13px', color: '#9A9A9A', fontFamily: "'Lato', sans-serif" }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#3CB815', fontWeight: 700, textDecoration: 'none' }}>
                Log In
              </Link>
            </Typography>
          </Box>

        </Box>
      </Box>

      {/* ── RIGHT — Visual Panel ── */}
      <Box
        sx={{
          flex: '0 0 44%',
          background: 'linear-gradient(145deg, #0A3D0A 0%, #1B5E20 50%, #2E7D32 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 8,
        }}
      >
        {/* Dot grid */}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

        {/* Ghost text */}
        <Typography sx={{ position: 'absolute', fontFamily: "'Cormorant Garamond', serif", fontSize: '220px', fontWeight: 900, color: 'rgba(255,255,255,0.025)', bottom: -30, right: -20, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
          OTP
        </Typography>

        {/* Lock ring badge */}
        <Box sx={{ position: 'relative', width: 240, height: 240, mb: 6, zIndex: 2 }}>
          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
          <Box sx={{
            position: 'absolute', inset: 16, borderRadius: '50%',
            border: '1.5px dashed rgba(129,199,132,0.4)',
            animation: 'spin 40s linear infinite',
            '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
          }} />
          <Box sx={{
            position: 'absolute', inset: 36, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(76,175,80,0.2)',
          }}>
            <LockOutlinedIcon sx={{ color: '#A5D6A7', fontSize: '40px', mb: 0.5 }} />
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', color: '#A5D6A7', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
              Secure
            </Typography>
          </Box>
          {/* Orbit dots */}
          {[0, 120, 240].map((deg) => (
            <Box key={deg} sx={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, bgcolor: '#66BB6A', borderRadius: '50%', transform: `rotate(${deg}deg) translateX(118px) translateY(-50%)`, boxShadow: '0 0 8px rgba(102,187,106,0.8)' }} />
          ))}
        </Box>

        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 700, color: '#fff', mb: 2, textAlign: 'center', zIndex: 2, lineHeight: 1.1 }}>
          One step<br />
          <Box component="span" sx={{ color: '#A5D6A7', fontStyle: 'italic' }}>away</Box>
        </Typography>

        <Typography sx={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', maxWidth: 320, textAlign: 'center', lineHeight: 1.8, zIndex: 2, fontFamily: "'Lato', sans-serif" }}>
          Enter the code we sent to your inbox to verify your identity and complete sign-up.
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 5, mt: 6, zIndex: 2 }}>
          {[{ num: '256-bit', label: 'Encrypted' }, { num: '100%', label: 'Secure' }].map((s) => (
            <Box key={s.label} textAlign="center">
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.num}</Typography>
              <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', mt: 0.5 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default OtpVerify;