import * as React from 'react';
import { Box, Modal, Backdrop, Fade, Button, Typography, Divider } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';

const TYPES = ['Clothes', 'Shoes', 'Plants', 'Accessories', 'Toys'];
const BRANDS = ['Iconic', 'VIEN', 'Adidas', 'Green Toys'];
const PRICES = ['Under ₹500', '₹500–1K', '₹1K–5K', 'Above ₹5K'];

const pillSx = (active) => ({
  px: '14px',
  py: '8px',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: 500,
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderColor: active ? '#3CB815' : '#E0E0E0',
  bgcolor: active ? '#E8F5E9' : '#fff',
  color: active ? '#2E7D32' : '#555',
  '&:hover': {
    borderColor: '#3CB815',
    bgcolor: active ? '#E8F5E9' : 'rgba(60, 184, 21, 0.04)',
  },
});

export default function ProdFilterModal() {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [price, setPrice] = React.useState('');

  const handleReset = () => {
    setType('');
    setBrand('');
    setPrice('');
  };

  const handleApply = () => {
    console.log({ type, brand, price });
    setOpen(false);
  };

  return (
    <Box>
      <Button
        onClick={() => setOpen(true)}
        startIcon={<TuneIcon sx={{ fontSize: '18px !important' }} />}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E0E0E0',
          bgcolor: '#fff',
          color: '#333',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          px: 2,
          py: 1,
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#3CB815',
            color: '#2E7D32',
            bgcolor: '#F1F8E9',
            boxShadow: 'none',
          },
        }}
      >
        Filter
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              maxHeight: '90vh',
              bgcolor: '#fff',
              borderRadius: '24px',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={3}
              sx={{ borderBottom: '1px solid #f0f0f0' }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1A1A1A',
                }}
              >
                Filters
              </Typography>
              <Box
                onClick={() => setOpen(false)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#E0E0E0' },
                }}
              >
                <CloseIcon sx={{ fontSize: '18px', color: '#666' }} />
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              {/* Product Type */}
              <Box mb={3}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#555',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    mb: 1.5,
                  }}
                >
                  Category
                </Typography>
                <Box display="flex" flexWrap="wrap" gap="8px">
                  {TYPES.map((t) => (
                    <Box key={t} onClick={() => setType(t === type ? '' : t)} sx={pillSx(type === t)}>
                      {t}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Brand */}
              <Box mb={3}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#555',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    mb: 1.5,
                  }}
                >
                  Brand
                </Typography>
                <Box display="flex" flexWrap="wrap" gap="8px">
                  {BRANDS.map((b) => (
                    <Box key={b} onClick={() => setBrand(b === brand ? '' : b)} sx={pillSx(brand === b)}>
                      {b}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Price */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#555',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    mb: 1.5,
                  }}
                >
                  Price Range
                </Typography>
                <Box display="flex" flexWrap="wrap" gap="8px">
                  {PRICES.map((p) => (
                    <Box key={p} onClick={() => setPrice(p === price ? '' : p)} sx={pillSx(price === p)}>
                      {p}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Footer Actions */}
            <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderTop: '1px solid #f0f0f0' }}>
              <Button
                onClick={handleApply}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#3CB815',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(60, 184, 21, 0.25)',
                  '&:hover': { bgcolor: '#2fa012', boxShadow: '0 6px 18px rgba(60, 184, 21, 0.35)' },
                }}
              >
                Show Results
              </Button>
              <Button
                onClick={handleReset}
                fullWidth
                sx={{
                  mt: 1.5,
                  color: '#888',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#333', bgcolor: 'transparent' },
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}