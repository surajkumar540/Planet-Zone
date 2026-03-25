import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';

const categories = ['All', 'Accessories', 'Clothes', 'Home', 'Furniture', 'Toys'];

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '85vw', sm: 320 },
    bgcolor: '#fff',
    boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
    borderRadius: '20px',
    p: 3.5,
    outline: 'none',
};

export default function FilterModal({ category, setCategory }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Box>
            {/* ── Filter Button ── */}
            <Box
                onClick={() => setOpen(true)}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    py: 1.1,
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.22)',
                        border: '1.5px solid rgba(255,255,255,0.5)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0px)', opacity: 0.85 },
                }}
            >
                <TuneIcon sx={{ fontSize: '16px', opacity: 0.9 }} />
                <Typography sx={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: "'Lato', sans-serif" }}>
                    Filter
                </Typography>
                {category !== 'All' && (
                    <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: '#A5D6A7',
                        boxShadow: '0 0 6px #A5D6A7',
                    }} />
                )}
                <KeyboardArrowDownIcon sx={{ fontSize: '16px', opacity: 0.7 }} />
            </Box>

            {/* ── Modal ── */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300, sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.35)' } } }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        {/* Header */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TuneIcon sx={{ fontSize: '18px', color: '#2E7D32' }} />
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#1A2F1A', fontFamily: "'Lato', sans-serif" }}>
                                    Filter Products
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#aaa', '&:hover': { color: '#333' } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Label */}
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#8A9E86', letterSpacing: '1px', textTransform: 'uppercase', mb: 1.2, fontFamily: "'Lato', sans-serif" }}>
                            Category
                        </Typography>

                        {/* Category Pills */}
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {categories.map((cat) => (
                                <Box
                                    key={cat}
                                    onClick={() => { setCategory(cat); setOpen(false); }}
                                    sx={{
                                        px: 2,
                                        py: 0.8,
                                        borderRadius: '50px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        fontFamily: "'Lato', sans-serif",
                                        cursor: 'pointer',
                                        transition: 'all 0.18s',
                                        border: '1.5px solid',
                                        borderColor: category === cat ? '#2E7D32' : '#E0EBE0',
                                        bgcolor: category === cat ? '#2E7D32' : '#fff',
                                        color: category === cat ? '#fff' : '#4a6741',
                                        boxShadow: category === cat ? '0 4px 14px rgba(46,125,50,0.25)' : 'none',
                                        '&:hover': {
                                            borderColor: '#2E7D32',
                                            bgcolor: category === cat ? '#256427' : '#F0F9EE',
                                        },
                                    }}
                                >
                                    {cat}
                                </Box>
                            ))}
                        </Box>

                        {/* Divider */}
                        <Box sx={{ height: '1px', bgcolor: '#EEF4EC', my: 2.5 }} />

                        {/* Reset */}
                        <Box
                            onClick={() => { setCategory('All'); setOpen(false); }}
                            sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                py: 1, borderRadius: '12px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, color: '#8A9E86',
                                fontFamily: "'Lato', sans-serif",
                                transition: 'all 0.18s',
                                '&:hover': { bgcolor: '#F5FBF4', color: '#2E7D32' },
                            }}
                        >
                            Reset Filter
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}