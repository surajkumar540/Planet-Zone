import React, { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setPrice } from "../../redux/reducers/orderSlice";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DiscountOutlinedIcon from "@mui/icons-material/DiscountOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";

const Row = ({ label, value, icon, valueColor, bold }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
    <Box display="flex" alignItems="center" gap={1}>
      {icon && (
        <Box sx={{ color: "#8A9E86", display: "flex", alignItems: "center" }}>
          {icon}
        </Box>
      )}
      <Typography
        sx={{
          fontSize: "13px",
          color: bold ? "#1A2F1A" : "#5a7a54",
          fontWeight: bold ? 700 : 500,
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: bold ? 700 : 500,
        color: valueColor || (bold ? "#1A2F1A" : "#1A2F1A"),
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const CartTable = () => {
  const dispatch = useDispatch();
  const { data: products } = useSelector((state) => state?.cart);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);

  useEffect(() => {
    let total = 0,
      discount = 0;
    products.forEach((item) => {
      total += item.totalPrice * item.qty;
      discount += item.price * (item.discount / 100) * item.qty;
    });
    setTotalPrice(total);
    setTotalDiscount(discount);
    dispatch(setPrice(total));
  }, [products]);

  const mrp = Math.floor(totalPrice + totalDiscount);
  const savings = Math.floor(totalDiscount);
  const finalTotal = Math.floor(totalPrice);

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "18px",
        border: "1px solid #EEF4EC",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(46,125,50,0.07)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1B5E20",
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ReceiptOutlinedIcon sx={{ fontSize: "18px", color: "#A5D6A7" }} />
        <Typography
          sx={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.5px",
          }}
        >
          Price Details
        </Typography>
      </Box>

      <Box px={2.5} py={1.5}>
        <Row
          label={`MRP (${products.length} item${products.length !== 1 ? "s" : ""})`}
          value={`₹${mrp}`}
        />
        <Divider sx={{ borderColor: "#F0F9EE" }} />

        <Row
          label="Discount"
          value={`− ₹${savings}`}
          icon={<DiscountOutlinedIcon sx={{ fontSize: "15px" }} />}
          valueColor="#3CB815"
        />
        <Divider sx={{ borderColor: "#F0F9EE" }} />

        <Row
          label="Delivery Charges"
          value={
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography
                component="span"
                sx={{
                  fontSize: "12px",
                  color: "#bbb",
                  textDecoration: "line-through",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                ₹40
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#3CB815",
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                FREE
              </Typography>
            </Box>
          }
          icon={<LocalShippingOutlinedIcon sx={{ fontSize: "15px" }} />}
        />
        <Divider sx={{ borderColor: "#EEF4EC", mt: 0.5 }} />

        <Box py={1.5}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#1A2F1A",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Total Amount
            </Typography>
            <Typography
              sx={{
                fontSize: "17px",
                fontWeight: 800,
                color: "#2E7D32",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              ₹{finalTotal}
            </Typography>
          </Box>
        </Box>

        {/* Savings callout */}
        <Box
          sx={{
            bgcolor: "#E8F5E9",
            borderRadius: "12px",
            px: 2,
            py: 1.2,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2E7D32",
              fontFamily: "'Lato', sans-serif",
              textAlign: "center",
            }}
          >
            🎉 You save ₹{savings + 40} on this order!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CartTable;
