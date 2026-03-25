import React from 'react';
import { Box, CardMedia, Typography, IconButton } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Product = ({ obj }) => {
    const { _id } = obj;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <Box
            onClick={() => navigate(`/product/${_id}`)}
            sx={{
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: '1px solid #EEF4EC',
                overflow: 'hidden',
                bgcolor: '#fff',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                    boxShadow: '0 8px 28px rgba(60,184,21,0.13)',
                    transform: 'translateY(-4px)',
                },
            }}
        >
            {/* Image */}
            <Box sx={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    image={obj?.image}
                    alt={obj?.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.05)' },
                    }}
                />
            </Box>

            {/* Info */}
            <Box sx={{ p: { xs: '10px', sm: '12px' }, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                <Typography
                    sx={{ fontSize: { xs: '10px', sm: '11px' }, color: '#8A9E86', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}
                >
                    {obj?.brand || 'Organic'}
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: '13px', sm: '14px' },
                        fontWeight: 600,
                        color: '#1A2F1A',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {obj?.name || 'Product'}
                </Typography>

                {/* Price row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: { xs: '15px', sm: '17px' }, fontWeight: 700, color: '#2E7D32' }}>
                                ₹{Math.floor(obj?.totalPrice)}
                            </Typography>
                            {obj?.price && (
                                <Typography
                                    component="span"
                                    sx={{ fontSize: '12px', color: '#aaa', textDecoration: 'line-through' }}
                                >
                                    ₹{obj?.price}
                                </Typography>
                            )}
                        </Box>
                        {obj?.discount && (
                            <Typography sx={{ fontSize: '11px', color: '#3CB815', fontWeight: 600 }}>
                                {obj?.discount - obj?.gst}% off
                            </Typography>
                        )}
                    </Box>

                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); /* handleCart */ }}
                        sx={{
                            bgcolor: '#E8F5E9',
                            borderRadius: '10px',
                            p: '7px',
                            '&:hover': { bgcolor: '#C8E6C9' },
                        }}
                    >
                        <ShoppingCartOutlinedIcon sx={{ fontSize: '18px', color: '#2E7D32' }} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default Product;