import React, { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TuneIcon from '@mui/icons-material/Tune';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SpaIcon from '@mui/icons-material/Spa';

const categories = [
    { label: 'All', emoji: '🌿' },
    { label: 'Accessories', emoji: '👜' },
    { label: 'Clothes', emoji: '👕' },
    { label: 'Home', emoji: '🏠' },
    { label: 'Furniture', emoji: '🪑' },
    { label: 'Toys', emoji: '🧸' },
];

export default function FilterModal({ category, setCategory }) {
    const [open, setOpen] = useState(false);

    const handleSelect = (item) => {
        setCategory(item);
        setOpen(false);
    };

    return (
        <Box>
            {/* Trigger button — white pill on dark banner */}
            <Button
                onClick={() => setOpen(true)}
                startIcon={<TuneIcon sx={{ fontSize: '16px' }} />}
                sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1.1,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: "'Lato', sans-serif",
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.4)',
                    },
                }}
            >
                {category !== 'All' ? `Category: ${category}` : 'Filter by Category'}
            </Button>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 250, sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.35)' } } }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '88vw', sm: 360 },
                            bgcolor: '#fff',
                            borderRadius: '24px',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
                            overflow: 'hidden',
                            outline: 'none',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                                px: 3,
                                py: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, zIndex: 1 }}>
                                <SpaIcon sx={{ color: '#A5D6A7', fontSize: '20px' }} />
                                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                                    Browse Category
                                </Typography>
                            </Box>
                            <Box
                                onClick={() => setOpen(false)}
                                sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, transition: 'background 0.2s' }}
                            >
                                <CloseIcon sx={{ color: '#fff', fontSize: '16px' }} />
                            </Box>
                        </Box>

                        {/* Category List */}
                        <Box sx={{ py: 1.5, px: 1.5 }}>
                            {categories.map(({ label, emoji }) => {
                                const isActive = category === label;
                                return (
                                    <Box
                                        key={label}
                                        onClick={() => handleSelect(label)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            px: 2,
                                            py: 1.4,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            bgcolor: isActive ? '#E8F5E9' : 'transparent',
                                            transition: 'all 0.15s',
                                            mb: 0.5,
                                            '&:hover': { bgcolor: isActive ? '#E8F5E9' : '#F7FAF5' },
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Typography sx={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '14px',
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? '#2E7D32' : '#333',
                                                    fontFamily: "'Lato', sans-serif",
                                                    transition: 'color 0.15s',
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                        </Box>
                                        {isActive && (
                                            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#3CB815', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckIcon sx={{ fontSize: '13px', color: '#fff' }} />
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                            <Button
                                fullWidth
                                onClick={() => { setCategory('All'); setOpen(false); }}
                                variant="outlined"
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: '#E0EDD8',
                                    color: '#6A9A5A',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    textTransform: 'none',
                                    fontFamily: "'Lato', sans-serif",
                                    py: 1.1,
                                    '&:hover': { borderColor: '#3CB815', bgcolor: '#F7FAF5' },
                                }}
                            >
                                Clear Filter
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}