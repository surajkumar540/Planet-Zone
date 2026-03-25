import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import SingleCartProduct from './SingleCartProduct';
import CartTable from "./CartTable";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CartProducts = ({ products }) => {
    const isUserLogged = useSelector((state) => state?.user?.isUserLogged);
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate(isUserLogged ? "/shipping" : "/login");
    };

    return (
        <Box sx={{ bgcolor: '#FAFDF8', minHeight: '100vh', pt: { xs: 8, md: 10 } }}>

            {/* Header */}
            <Box sx={{ px: { xs: 3, md: '7%' }, pb: 3, borderBottom: '1px solid #EEF4EC' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: '20px', color: '#2E7D32' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: '26px', md: '32px' }, fontWeight: 700, color: '#1A2F1A', lineHeight: 1 }}>
                            Your Cart
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#8A9E86', fontFamily: "'Lato', sans-serif" }}>
                            {products.length} {products.length === 1 ? 'item' : 'items'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {products.length === 0 ? (
                /* Empty state */
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={14} textAlign="center" px={3}>
                    <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 8px 24px rgba(60,184,21,0.15)' }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: '46px', color: '#3CB815' }} />
                    </Box>
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: '#1A2F1A', mb: 1 }}>
                        Your cart is empty
                    </Typography>
                    <Typography sx={{ color: '#8A9E86', mb: 4, maxWidth: 340, fontSize: '14px', lineHeight: 1.7, fontFamily: "'Lato', sans-serif" }}>
                        Looks like you haven't added anything yet. Browse our collection!
                    </Typography>
                    <Box
                        onClick={() => navigate('/shop')}
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 1,
                            bgcolor: '#2E7D32', color: '#fff',
                            px: 3.5, py: 1.3, borderRadius: '14px',
                            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                            fontFamily: "'Lato', sans-serif",
                            boxShadow: '0 6px 20px rgba(60,184,21,0.3)',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#256427', transform: 'translateY(-2px)' },
                        }}
                    >
                        Shop Now <ArrowForwardIcon sx={{ fontSize: '16px' }} />
                    </Box>
                </Box>
            ) : (
                <Box
                    sx={{
                        px: { xs: 2, sm: 3, md: '7%' },
                        py: { xs: 3, md: 4 },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 4 },
                        alignItems: 'flex-start',
                    }}
                >
                    {/* Left — Products list */}
                    <Box flex={1} minWidth={0}>
                        {products.map((item, index) => (
                            <SingleCartProduct key={index} obj={item} />
                        ))}

                        {/* Place Order button (below list on mobile, hidden on md+) */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleSubmit}
                                sx={{
                                    bgcolor: '#2E7D32', px: 3.5, py: 1.3,
                                    borderRadius: '14px', fontWeight: 700,
                                    fontSize: '14px', textTransform: 'none',
                                    boxShadow: '0 6px 20px rgba(46,125,50,0.3)',
                                    fontFamily: "'Lato', sans-serif",
                                    '&:hover': { bgcolor: '#256427' },
                                }}
                            >
                                Place Order
                            </Button>
                        </Box>
                    </Box>

                    {/* Right — Summary */}
                    <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0, position: { md: 'sticky' }, top: { md: '80px' } }}>
                        <CartTable />
                        {/* Place Order (desktop) */}
                        <Button
                            fullWidth
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={handleSubmit}
                            sx={{
                                mt: 2,
                                bgcolor: '#2E7D32', py: 1.4,
                                borderRadius: '14px', fontWeight: 700,
                                fontSize: '15px', textTransform: 'none',
                                boxShadow: '0 6px 20px rgba(46,125,50,0.3)',
                                fontFamily: "'Lato', sans-serif",
                                display: { xs: 'none', md: 'flex' },
                                '&:hover': { bgcolor: '#256427' },
                            }}
                        >
                            Place Order
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default CartProducts;