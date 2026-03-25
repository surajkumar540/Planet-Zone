import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SpaIcon from '@mui/icons-material/Spa';
import { Link } from 'react-router-dom';

const NavLink = ({ to, children }) => (
  <Typography
    component={Link}
    to={to}
    sx={{
      display: 'block',
      fontSize: '14px',
      color: 'rgba(255,255,255,0.55)',
      lineHeight: 1,
      mb: 2.5,
      cursor: 'pointer',
      textDecoration: 'none',
      fontFamily: "'Lato', sans-serif",
      fontWeight: 400,
      transition: 'color 0.2s, padding-left 0.2s',
      '&:hover': {
        color: '#A5D6A7',
        paddingLeft: '6px',
      },
    }}
  >
    {children}
  </Typography>
);

const ColHead = ({ children }) => (
  <Typography
    sx={{
      fontSize: '10px',
      fontWeight: 800,
      color: 'rgba(255,255,255,0.35)',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      mb: 3,
      fontFamily: "'Lato', sans-serif",
    }}
  >
    {children}
  </Typography>
);

const Footer = () => (
  <Box
    sx={{
      background: 'linear-gradient(180deg, #0D2610 0%, #0A1E0C 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Subtle background texture */}
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }}
    />

    {/* Green top accent line */}
    <Box sx={{ height: '3px', background: 'linear-gradient(90deg, #1B5E20, #3CB815, #81C784, #3CB815, #1B5E20)' }} />

    {/* Main content */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
        gap: { xs: 5, sm: 4, md: 6 },
        py: { xs: 5, md: 7 },
        px: { xs: 4, sm: 6, md: '7%' },
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Brand Column */}
      <Box>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.2,
            textDecoration: 'none',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#3CB815',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(60,184,21,0.4)',
            }}
          >
            <SpaIcon sx={{ color: '#fff', fontSize: '20px' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.3px',
              lineHeight: 1,
            }}
          >
            Planet
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: '13.5px',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.8,
            mb: 3.5,
            maxWidth: 240,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Fresh, organic produce delivered directly from sustainable farms to
          your doorstep.
        </Typography>

        {/* Social Icons */}
        <Box sx={{ display: 'flex', gap: 1.2 }}>
          {[
            { Icon: FacebookIcon, color: '#1877F2' },
            { Icon: InstagramIcon, color: '#E1306C' },
            { Icon: WhatsAppIcon, color: '#25D366' },
          ].map(({ Icon, color }, i) => (
            <IconButton
              key={i}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: `${color}22`,
                  borderColor: `${color}66`,
                  color: color,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Icon sx={{ fontSize: '16px' }} />
            </IconButton>
          ))}
        </Box>
      </Box>

      {/* Company */}
      <Box>
        <ColHead>Company</ColHead>
        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/shop">Shop</NavLink>
      </Box>

      {/* Account */}
      <Box>
        <ColHead>Account</ColHead>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/signup">Sign Up</NavLink>
        <NavLink to="/cart">View Cart</NavLink>
      </Box>

      {/* Contact Info */}
      <Box>
        <ColHead>Get in Touch</ColHead>
        {[
          { label: '📍', val: '5143 Tilak Market, Delhi 110042' },
          { label: '📞', val: '(+91) 1454-548' },
          { label: '🕐', val: 'Mon–Sat, 10:00–18:00' },
        ].map(({ label, val }) => (
          <Box key={label} sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'flex-start' }}>
            <Typography sx={{ fontSize: '13px', lineHeight: 1.6 }}>{label}</Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {val}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Bottom bar */}
    <Box
      sx={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        px: { xs: 4, sm: 6, md: '7%' },
        py: 2.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.22)',
          fontFamily: "'Lato', sans-serif",
        }}
      >
        © 2026 Planet. All rights reserved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {['Privacy Policy', 'Terms of Service'].map((t) => (
          <Typography
            key={t}
            sx={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.22)',
              cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              '&:hover': { color: 'rgba(255,255,255,0.5)' },
              transition: 'color 0.2s',
            }}
          >
            {t}
          </Typography>
        ))}
      </Box>
    </Box>
  </Box>
);

export default Footer;