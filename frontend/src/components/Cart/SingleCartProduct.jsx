import React, { useState } from "react";
import { Box, CardMedia, Typography, IconButton, Chip } from "@mui/material";
import { useDispatch } from 'react-redux';
import { addToCartAsync, removeFromCart } from '../../redux/reducers/cartSlice';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useNavigate } from "react-router-dom";

const SingleCartProduct = ({ obj }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [qty, setQty] = useState(obj.qty);

    const handleCart = (quantity) => {
        dispatch(addToCartAsync({ id: obj?._id, qty: quantity }));
    };

    const handlePlus = () => {
        if (qty < obj.countInStock) {
            const value = qty + 1;
            setQty(value);
            handleCart(value);
        }
    };

    const handleMinus = () => {
        if (qty > 1) {
            const value = qty - 1;
            setQty(value);
            handleCart(value);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: { xs: 1.5, sm: 2 },
                bgcolor: "#fff",
                borderRadius: "18px",
                border: "1px solid #EEF4EC",
                p: { xs: 1.5, sm: 2 },
                mb: 2,
                transition: "all 0.25s ease",
                "&:hover": {
                    boxShadow: "0 8px 30px rgba(46,125,50,0.1)",
                    borderColor: "#C8E6C9",
                    transform: "translateY(-2px)",
                },
            }}
        >
            {/* Image */}
            <Box
                onClick={() => navigate(`/product/${obj._id}`)}
                sx={{
                    width: { xs: 90, sm: 110 },
                    minWidth: { xs: 90, sm: 110 },
                    height: { xs: 90, sm: 110 },
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
            >
                <CardMedia
                    component="img"
                    image={obj?.image}
                    alt={obj?.name}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.06)" },
                    }}
                />
            </Box>

            {/* Content */}
            <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between" minWidth={0}>
                
                {/* Top row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Box
                        onClick={() => navigate(`/product/${obj._id}`)}
                        sx={{ cursor: "pointer", flex: 1, minWidth: 0 }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "13px", sm: "15px" },
                                fontWeight: 700,
                                color: "#1A2F1A",
                                fontFamily: "'Lato', sans-serif",
                                lineHeight: 1.3,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {obj.name}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#8A9E86", mt: 0.3, fontFamily: "'Lato', sans-serif" }}>
                            {obj.brand}
                        </Typography>
                    </Box>

                    {/* Delete */}
                    <IconButton
                        size="small"
                        onClick={() => dispatch(removeFromCart(obj._id))}
                        sx={{
                            color: "#ccc",
                            borderRadius: "10px",
                            p: "6px",
                            flexShrink: 0,
                            "&:hover": { color: "#e53935", bgcolor: "#FFEBEE" },
                            transition: "all 0.2s",
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                </Box>

                {/* Price */}
                <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                    <Typography sx={{ fontSize: { xs: "16px", sm: "18px" }, fontWeight: 800, color: "#2E7D32", fontFamily: "'Lato', sans-serif" }}>
                        ₹{Math.floor(obj.totalPrice * qty)}
                    </Typography>
                    {obj?.price && (
                        <Typography component="span" sx={{ fontSize: "12px", color: "#bbb", textDecoration: "line-through" }}>
                            ₹{Math.floor(obj.price * qty)}
                        </Typography>
                    )}
                    {obj?.discount && (
                        <Chip
                            label={`${obj.discount - obj.gst}% off`}
                            size="small"
                            sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontSize: "10px", fontWeight: 700, height: 20, borderRadius: "6px" }}
                        />
                    )}
                </Box>

                {/* Bottom row — qty + delivery */}
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    
                    {/* Qty stepper */}
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            border: "1.5px solid #E0EBE0",
                            borderRadius: "50px",
                            overflow: "hidden",
                            width: "fit-content",
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={handleMinus}
                            disabled={qty <= 1}
                            sx={{ p: "5px", borderRadius: 0, color: qty <= 1 ? "#ccc" : "#2E7D32", "&:hover": { bgcolor: "#F0F9EE" } }}
                        >
                            <RemoveIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                        <Typography
                            sx={{
                                px: 1.5, minWidth: 28, textAlign: "center",
                                fontSize: "13px", fontWeight: 700, color: "#1A2F1A",
                                fontFamily: "'Lato', sans-serif",
                            }}
                        >
                            {qty}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handlePlus}
                            disabled={qty >= obj.countInStock}
                            sx={{ p: "5px", borderRadius: 0, color: qty >= obj.countInStock ? "#ccc" : "#2E7D32", "&:hover": { bgcolor: "#F0F9EE" } }}
                        >
                            <AddIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                    </Box>

                    {/* Free delivery badge */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: "14px", color: "#3CB815" }} />
                        <Typography sx={{ fontSize: "11px", color: "#3CB815", fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>
                            Free Delivery
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default SingleCartProduct;