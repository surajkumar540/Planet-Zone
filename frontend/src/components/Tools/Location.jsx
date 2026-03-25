import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Container } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CallIcon from '@mui/icons-material/Call';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SpaIcon from '@mui/icons-material/Spa';

const contactItems = [
  {
    icon: <LocationOnOutlinedIcon sx={{ fontSize: '20px' }} />,
    iconBg: '#E8F5E9',
    iconColor: '#3CB815',
    label: 'Head Office',
    value: '6 Shalimar Street, Rohini, Delhi, India',
  },
  {
    icon: <EmailOutlinedIcon sx={{ fontSize: '20px' }} />,
    iconBg: '#FFF3E0',
    iconColor: '#F57C00',
    label: 'Email Us',
    value: 'contact@planetorganic.com',
  },
  {
    icon: <CallIcon sx={{ fontSize: '20px' }} />,
    iconBg: '#E3F2FD',
    iconColor: '#1976D2',
    label: 'Call Us',
    value: '+91 9560323232',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: '20px' }} />,
    iconBg: '#F3E5F5',
    iconColor: '#7B1FA2',
    label: 'Working Hours',
    value: 'Mon – Sun: 9:00 am to 6:00 pm',
  },
];

const Location = () => {
  const [search, setSearch] = useState('Shalimar Bagh');
  const [mapLink, setMapLink] = useState('');

  useEffect(() => {
    const lat = 28.6129;
    const lon = 77.2295;
    setMapLink(`https://maps.google.com/maps?q=${lat},${lon}&hl=en;&output=embed`);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const encoded = encodeURIComponent(search);
    setMapLink(`https://maps.google.com/maps?q=${encoded}&output=embed`);
  };

  return (
    <Box sx={{ bgcolor: '#FAFDF8', py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4, md: '6%' } }}>

      {/* ── Section Header ── */}
      <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(60,184,21,0.08)',
            color: '#3CB815',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            px: 2,
            py: 0.8,
            borderRadius: '50px',
            border: '1px solid rgba(60,184,21,0.2)',
            mb: 2.5,
          }}
        >
          <SpaIcon sx={{ fontSize: '14px' }} />
          Get In Touch
        </Box>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: '34px', md: '48px' },
            fontWeight: 700,
            color: '#1A2F1A',
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Visit Our Store
        </Typography>
        <Typography
          sx={{
            fontSize: '15px',
            color: '#8A9E86',
            maxWidth: 480,
            mx: 'auto',
            lineHeight: 1.7,
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Come see us in person or reach out any time. We'd love to hear from you.
        </Typography>
      </Box>

      {/* ── Main Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' },
          gap: { xs: 4, md: 5 },
          alignItems: 'start',
        }}
      >
        {/* ── LEFT — Contact Info ── */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '24px',
            border: '1.5px solid #EEF4EC',
            p: { xs: 3, md: 4 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              bgcolor: 'linear-gradient(135deg, #1B5E20, #3CB815)',
              background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
              borderRadius: '16px',
              p: 3,
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* bg dot texture */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                borderRadius: '16px',
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '26px',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.1,
                zIndex: 1,
                position: 'relative',
              }}
            >
              Planet Organic
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.65)',
                mt: 0.5,
                fontFamily: "'Lato', sans-serif",
                position: 'relative',
                zIndex: 1,
              }}
            >
              Sustainable living, delivered to you.
            </Typography>
          </Box>

          {/* Contact Items */}
          <Box display="flex" flexDirection="column" gap={3}>
            {contactItems.map((item) => (
              <Box
                key={item.label}
                display="flex"
                alignItems="flex-start"
                gap={2}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: '#F7FAF5' },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: item.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: item.iconColor,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#AAAAAA',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      mb: 0.3,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#2A2A2A',
                      lineHeight: 1.5,
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Divider */}
          <Box sx={{ height: '1px', bgcolor: '#F0F4EE', my: 3 }} />

          {/* Direction CTA */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<LocationOnOutlinedIcon />}
            onClick={() => window.open('https://maps.google.com/?q=28.6129,77.2295', '_blank')}
            sx={{
              bgcolor: '#3CB815',
              color: '#fff',
              borderRadius: '14px',
              py: 1.4,
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'none',
              fontFamily: "'Lato', sans-serif",
              boxShadow: '0 6px 20px rgba(60,184,21,0.28)',
              transition: 'all 0.25s',
              '&:hover': {
                bgcolor: '#33a313',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 28px rgba(60,184,21,0.36)',
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            Get Directions
          </Button>
        </Box>

        {/* ── RIGHT — Map ── */}
        <Box
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1.5px solid #EEF4EC',
            height: { xs: '420px', md: '560px' },
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          {/* Search overlay */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              zIndex: 10,
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a location..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: '12px',
                  fontSize: '13px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  '& fieldset': { border: 'none' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#3CB815', fontSize: '18px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#3CB815',
                borderRadius: '12px',
                px: 2.5,
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(60,184,21,0.3)',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#33a313' },
              }}
            >
              Search
            </Button>
          </Box>

          {/* Map iframe */}
          {mapLink && (
            <iframe
              src={mapLink}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            />
          )}

          {/* Open in Maps pill */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <Button
              variant="contained"
              size="small"
              endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => window.open('https://maps.google.com/?q=28.6129,77.2295', '_blank')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                color: '#1A2F1A',
                borderRadius: '50px',
                px: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'none',
                fontFamily: "'Lato', sans-serif",
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: '#fff', transform: 'translateY(-1px)' },
                transition: 'all 0.2s',
              }}
            >
              Open in Google Maps
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Location;