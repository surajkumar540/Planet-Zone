import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    FormControl, 
    MenuItem, 
    Select, 
    InputLabel, 
    Container, 
    Grid, 
    Paper, 
    Chip,
    Rating,
    Divider 
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCartAsync } from '../../redux/reducers/cartSlice';
import { useNavigate } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const ShowProduct = ({ obj }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [qty, setQty] = useState(1);

    const handleCart = () => {
        const dummy = {
            id: obj?._id,
            qty: qty
        };
        dispatch(addToCartAsync(dummy));
        navigate("/cart");
    };

    useEffect(() => {
        if (obj?.countInStock) setQty(1);
    }, [obj]);

    // Loading State
    if (!obj?.name) {
        return <ProductDetailSkeleton />;
    }

    return (
        <Box sx={{ bgcolor: '#FDFBF7', minHeight: '80vh', py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={6}>
                    
                    {/* LEFT: Image Section */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                position: 'sticky',
                                top: 100,
                                border: '1px solid rgba(0,0,0,0.05)',
                            }}
                        >
                            <Box sx={{ p: 4, bgcolor: '#fff', display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="img"
                                    src={obj?.image}
                                    alt={obj?.name}
                                    sx={{
                                        width: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT: Details Section */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ py: 2 }}>
                            {/* Breadcrumbs / Brand */}
                            <Typography variant="body2" sx={{ color: '#3CB815', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                                {obj?.brand || 'Organic Brand'}
                            </Typography>

                            {/* Title */}
                            <Typography variant="h3" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1A1A1A', mb: 2, lineHeight: 1.2 }}>
                                {obj?.name}
                            </Typography>

                            {/* Rating */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <Rating value={4.5} precision={0.5} readOnly size="small" />
                                <Typography variant="body2" color="text.secondary">(24 Reviews)</Typography>
                                <Chip label="In Stock" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, ml: 1 }} />
                            </Box>

                            {/* Price Block */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
                                    ₹{Math.floor(obj?.totalPrice)}
                                </Typography>
                                {obj?.price > obj?.totalPrice && (
                                    <>
                                        <Typography variant="h6" sx={{ color: '#999', textDecoration: 'line-through' }}>
                                            ₹{obj?.price}
                                        </Typography>
                                        <Chip 
                                            label={`${obj?.discount}% OFF`} 
                                            size="small" 
                                            sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', fontWeight: 700 }} 
                                        />
                                    </>
                                )}
                            </Box>

                            {/* Description */}
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                                {obj?.description || 'No description available for this product.'}
                            </Typography>

                            <Divider sx={{ mb: 4 }} />

                            {/* Actions: Quantity & Add to Cart */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                {/* Quantity Selector */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mr: 1 }}>Qty:</Typography>
                                    <FormControl size="small">
                                        <Select
                                            value={qty}
                                            onChange={(e) => setQty(e.target.value)}
                                            sx={{ width: 80, borderRadius: 2 }}
                                        >
                                            {[...Array(obj?.countInStock).keys()].map((x) => (
                                                <MenuItem key={x} value={x + 1}>{x + 1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Add to Cart Button */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<ShoppingCartOutlinedIcon />}
                                    onClick={handleCart}
                                    sx={{
                                        bgcolor: '#3CB815',
                                        color: '#fff',
                                        fontWeight: 700,
                                        py: 1.5,
                                        px: 5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        boxShadow: '0 4px 14px rgba(60, 184, 21, 0.25)',
                                        '&:hover': { bgcolor: '#2fa012', boxShadow: '0 6px 20px rgba(60, 184, 21, 0.35)' }
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Box>

                            {/* Extra Info */}
                            <Box sx={{ display: 'flex', gap: 4, color: 'text.secondary' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocalShippingOutlinedIcon fontSize="small" />
                                    <Typography variant="body2">Free Delivery</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SecurityOutlinedIcon fontSize="small" />
                                    <Typography variant="body2">Secure Payment</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ShowProduct;

// Skeleton Component for Loading State
function ProductDetailSkeleton() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={6}>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Skeleton width="20%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={50} sx={{ mb: 2 }} />
                    <Skeleton width="40%" height={30} sx={{ mb: 4 }} />
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="80%" height={20} sx={{ mb: 4 }} />
                    <Skeleton width="50%" height={60} />
                </Grid>
            </Grid>
        </Container>
    );
}