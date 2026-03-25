import React from 'react';
import { Box, CardMedia, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, addToCart } from '../../redux/reducers/cartSlice';

const Product = ({ obj }) => {
  const { _id } = obj;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Derive qty directly from Redux store (stays in sync across all instances) ──
  const cartItem = useSelector((state) =>
    state.cart.data.find((item) => item._id === _id)
  );
  const qty = cartItem?.qty ?? 0;

  // ── Add: fetch fresh product data via thunk, then upsert into cart ──
  const handleAdd = (e) => {
    e.stopPropagation();
    dispatch(addToCartAsync({ id: _id, qty: qty + 1 }));
  };

  // ── Remove: if qty becomes 0, overwrite with qty:0 so slice filters it out ──
  // (No API call needed for decrement — we already have the product data)
  const handleRemove = (e) => {
    e.stopPropagation();
    const newQty = qty - 1;

    if (newQty <= 0) {
      // Overwrite cart entry with qty:0; add a `qty === 0` guard in your
      // addToCart reducer if you want it auto-removed, OR just dispatch removeFromCart(_id)
      dispatch(
        addToCart({
          _id,
          brand: obj.brand,
          category: obj.category,
          countInStock: obj.countInStock,
          image: obj.image,
          name: obj.name,
          rating: obj.rating,
          price: obj.price,
          qty: 0,
          gst: obj.gst,
          discount: obj.discount,
          totalPrice: obj.totalPrice,
        })
      );
    } else {
      // Re-use thunk so cartSlice always gets fresh product data shape
      dispatch(addToCartAsync({ id: _id, qty: newQty }));
    }
  };

  const discountedPrice = obj?.totalPrice ?? obj?.price;
  const originalPrice = obj?.price;
  const hasDiscount = obj?.discount > 0 && originalPrice > discountedPrice;
  const rating = obj?.rating ?? 4;
  const reviewCount = obj?.reviewCount ?? 24;

  return (
    <Box
      onClick={() => navigate(`/product/${_id}`)}
      sx={{
        position: 'relative',
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        border: '1.5px solid #F0F0F0',
        cursor: 'pointer',
        overflow: 'hidden',
        height: '100%',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
        fontFamily: "'DM Sans', sans-serif",
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.09)',
          borderColor: '#D8F0CC',
        },
      }}
    >
      {/* ── Image ── */}
      <Box
        sx={{
          position: 'relative',
          pt: '105%',
          bgcolor: '#F6FAF3',
          overflow: 'hidden',
          borderBottom: '1.5px solid #F0F0F0',
        }}
      >
        <CardMedia
          component="img"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            '&:hover': { transform: 'scale(1.04)' },
          }}
          image={obj?.image}
          alt={obj?.name}
        />

        {hasDiscount && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: '#3CB815',
              color: '#fff',
              px: 1.2,
              py: 0.4,
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.03em',
              lineHeight: 1.4,
              boxShadow: '0 2px 8px rgba(60,184,21,0.3)',
            }}
          >
            -{obj.discount}%
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(6px)',
            color: '#555',
            px: 1.2,
            py: 0.4,
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {obj?.category || 'Organic'}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box
        sx={{
          p: '14px 16px 16px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: '10px',
            color: '#3CB815',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {obj?.brand || 'FreshMart'}
        </Typography>

        <Typography
          sx={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '40px',
          }}
        >
          {obj?.name || 'Product Name'}
        </Typography>

        {obj?.unit && (
          <Typography sx={{ fontSize: '11px', color: '#AAA', fontWeight: 500 }}>
            {obj.unit}
          </Typography>
        )}

        {/* Rating */}
        <Box display="flex" alignItems="center" gap="3px" mt="2px">
          {[1, 2, 3, 4, 5].map((i) =>
            i <= Math.floor(rating) ? (
              <StarIcon key={i} sx={{ color: '#F5A623', fontSize: '13px' }} />
            ) : i - rating < 1 ? (
              <StarHalfIcon key={i} sx={{ color: '#F5A623', fontSize: '13px' }} />
            ) : (
              <StarIcon key={i} sx={{ color: '#E0E0E0', fontSize: '13px' }} />
            )
          )}
          <Typography sx={{ fontSize: '11px', color: '#BBBBBB', ml: 0.5 }}>
            ({reviewCount})
          </Typography>
        </Box>

        {/* ── Price + Cart Row ── */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt="auto"
          pt="10px"
        >
          {/* Price */}
          <Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
              ₹{Math.floor(discountedPrice)}
            </Typography>
            {hasDiscount && (
              <Typography
                sx={{ fontSize: '12px', color: '#C0C0C0', textDecoration: 'line-through', lineHeight: 1.4 }}
              >
                ₹{Math.floor(originalPrice)}
              </Typography>
            )}
          </Box>

          {/* Add button  ↔  Qty stepper */}
          {qty === 0 ? (
            <Box
              onClick={handleAdd}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                bgcolor: '#3CB815',
                color: '#fff',
                px: 1.8,
                py: 0.9,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.2s, transform 0.15s',
                boxShadow: '0 4px 14px rgba(60,184,21,0.3)',
                '&:hover': { bgcolor: '#33a313', transform: 'scale(1.04)' },
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: '15px' }} />
              Add
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #3CB815',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                onClick={handleRemove}
                size="small"
                sx={{
                  color: '#3CB815',
                  borderRadius: 0,
                  px: 0.8,
                  py: 0.5,
                  '&:hover': { bgcolor: '#F0FAF0' },
                }}
              >
                <RemoveIcon sx={{ fontSize: '15px' }} />
              </IconButton>

              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  minWidth: '24px',
                  textAlign: 'center',
                  px: 0.5,
                }}
              >
                {qty}
              </Typography>

              <IconButton
                onClick={handleAdd}
                size="small"
                sx={{
                  color: '#fff',
                  bgcolor: '#3CB815',
                  borderRadius: 0,
                  px: 0.8,
                  py: 0.5,
                  '&:hover': { bgcolor: '#33a313' },
                }}
              >
                <AddIcon sx={{ fontSize: '15px' }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Product;